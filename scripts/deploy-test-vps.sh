#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $# -ne 1 || ! "$1" =~ ^[0-9a-f]{40}$ ]]; then
  echo "usage: $0 <40-character-origin-main-sha>" >&2
  exit 64
fi

TARGET_SHA="$1"
DEPLOY_ROOT="${WEBCLEVIO_DEPLOY_ROOT:-/root/web}"
SOURCE_REPO="${WEBCLEVIO_SOURCE_REPO:-$DEPLOY_ROOT/webclevio}"
RELEASES_DIR="$DEPLOY_ROOT/releases"
CONTAINER_NAME="webclevio-test"
NETWORK_NAME="root_default"
IMAGE_NAME="webclevio-test:${TARGET_SHA:0:12}"
RELEASE_DIR="$RELEASES_DIR/webclevio-test-${TARGET_SHA:0:12}"
LOCK_FILE="$DEPLOY_ROOT/.webclevio-test-deploy.lock"
ENV_FILE="$(mktemp "$DEPLOY_ROOT/.webclevio-test-env.XXXXXX")"
ENV_EXPORTER="$(mktemp "$DEPLOY_ROOT/.webclevio-env-exporter.XXXXXX.mjs")"
CANDIDATE_NAME="webclevio-candidate-${TARGET_SHA:0:12}"
PREVIOUS_IMAGE=""
ROLLBACK_IMAGE=""
SWITCH_STARTED=0

chmod 600 "$ENV_FILE"

cleanup() {
  docker rm -f "$CANDIDATE_NAME" >/dev/null 2>&1 || true
  rm -f "$ENV_FILE" "$ENV_EXPORTER"
}
trap cleanup EXIT

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "another webclevio test deployment is running" >&2
  exit 75
fi

git -C "$SOURCE_REPO" fetch --prune origin main
ORIGIN_MAIN_SHA="$(git -C "$SOURCE_REPO" rev-parse 'origin/main^{commit}')"
if [[ "$TARGET_SHA" != "$ORIGIN_MAIN_SHA" ]]; then
  echo "refusing deployment: target must equal origin/main ($ORIGIN_MAIN_SHA)" >&2
  exit 65
fi

if ! docker container inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
  echo "refusing deployment: existing $CONTAINER_NAME container is required" >&2
  exit 66
fi

if [[ "$(docker inspect -f '{{len .Mounts}}' "$CONTAINER_NAME")" != "0" ]]; then
  echo "refusing deployment: unexpected container mounts require manual review" >&2
  exit 67
fi

PREVIOUS_IMAGE="$(docker inspect -f '{{.Config.Image}}' "$CONTAINER_NAME")"
ROLLBACK_IMAGE="webclevio-test:rollback-$(date -u +%Y%m%d%H%M%S)"
docker image tag "$PREVIOUS_IMAGE" "$ROLLBACK_IMAGE"
git -C "$SOURCE_REPO" show "$TARGET_SHA:scripts/export-container-env.mjs" >"$ENV_EXPORTER"
docker inspect "$CONTAINER_NAME" | node "$ENV_EXPORTER" >"$ENV_FILE"

if [[ -e "$RELEASE_DIR" ]]; then
  echo "refusing deployment: release already exists: $RELEASE_DIR" >&2
  exit 68
fi

mkdir -p "$RELEASE_DIR"
git -C "$SOURCE_REPO" archive "$TARGET_SHA" | tar -x -C "$RELEASE_DIR"
printf '%s\n' "$TARGET_SHA" >"$RELEASE_DIR/DEPLOYED_SHA"
docker build --pull -t "$IMAGE_NAME" "$RELEASE_DIR"

docker run -d --name "$CANDIDATE_NAME" \
  --restart no \
  --network "$NETWORK_NAME" \
  --env-file "$ENV_FILE" \
  --label traefik.enable=false \
  "$IMAGE_NAME" >/dev/null

for _ in $(seq 1 24); do
  if docker exec "$CANDIDATE_NAME" node /app/scripts/smoke-homepage.mjs >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
docker exec "$CANDIDATE_NAME" node /app/scripts/smoke-homepage.mjs
docker rm -f "$CANDIDATE_NAME" >/dev/null

rollback() {
  local exit_code=$?
  trap - ERR
  if [[ "$SWITCH_STARTED" == "1" ]]; then
    echo "deployment failed; restoring $ROLLBACK_IMAGE" >&2
    docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
    start_public_container "$ROLLBACK_IMAGE"
  fi
  exit "$exit_code"
}
trap rollback ERR

start_public_container() {
  local image="$1"
  docker run -d --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    --network "$NETWORK_NAME" \
    --env-file "$ENV_FILE" \
    --label traefik.enable=true \
    --label traefik.docker.network="$NETWORK_NAME" \
    --label 'traefik.http.routers.webclevio-test.rule=Host(`test.clev.io`)' \
    --label traefik.http.routers.webclevio-test.entrypoints=websecure \
    --label traefik.http.routers.webclevio-test.tls=true \
    --label traefik.http.routers.webclevio-test.tls.certresolver=mytlschallenge \
    --label traefik.http.services.webclevio-test.loadbalancer.server.port=3000 \
    "$image" >/dev/null
}

SWITCH_STARTED=1
docker rm -f "$CONTAINER_NAME" >/dev/null
start_public_container "$IMAGE_NAME"

for _ in $(seq 1 24); do
  if node "$RELEASE_DIR/scripts/smoke-homepage.mjs" https://test.clev.io >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
node "$RELEASE_DIR/scripts/smoke-homepage.mjs" https://test.clev.io

SWITCH_STARTED=0
trap - ERR
echo "deployed_sha=$TARGET_SHA"
echo "image=$IMAGE_NAME"
echo "rollback_image=$ROLLBACK_IMAGE"
docker ps --filter "name=^/${CONTAINER_NAME}$" --format 'container={{.Names}} status={{.Status}} image={{.Image}}'
