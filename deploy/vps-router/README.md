# Clevio VPS routing

These files deploy to `/docker/clevio-domain-router` on the Clevio VPS.
Traefik sends only `/camp` and `/camp/...` on `clev.io` and `www.clev.io`
to this application. The apex homepage is available for another website.

Nginx mounts `default.conf` read-only. The existing application image,
database, and application environment do not change during routing updates.

Before applying an update, back up the existing Compose file and environment,
validate `docker compose config --quiet`, and test Nginx with the proposed
configuration. Apply using `docker compose up -d --pull never` in the VPS
directory, then verify `/camp`, its assets and API, and the apex exclusion.

## Separate homepage VPS

The main `clev.io` DNS A record points to `194.238.23.242`. The Camp application
stays on `72.61.213.46`. A DNS record cannot split one domain by URL path.

Create an A record `camp-origin` pointing to `72.61.213.46` (TTL 300). The
origin router accepts only `/camp` and `/camp/...` and obtains its own TLS
certificate. Certificate renewal remains independent of the main domain's IP.
Origin requests reach the application with canonical host `clev.io` and HTTPS
forwarding headers.

The team operating `194.238.23.242` must configure `/camp` and `/camp/...` to
reverse proxy to `https://camp-origin.clev.io`, preserving the full URI and
using `camp-origin.clev.io` for the upstream Host and TLS SNI. This is a proxy,
not a redirect: visitors continue to see `https://clev.io/camp`.

For Nginx, include `new-vps-nginx-camp.conf` inside the existing `clev.io` server
block alongside the main site's `location /`. Check for other location rules
that could take precedence, such as `location ^~ /` or an earlier matching
regex. Ensure the CA bundle path exists in the Nginx host/container. Validate
with `nginx -t`, then reload that Nginx instance. If Traefik routes separate
containers, its `/camp` router also needs higher priority than the homepage
router. The snippet is a handoff template and is not installed on the new VPS.

After installation, verify the main homepage is unchanged, `/camp` shows
"Clevio Innovator Camp", `/camp/api/content` returns JSON, Camp assets load,
and an unauthenticated `/camp/admin` request redirects to `/camp/login` on the
public `clev.io` host. `/campus` must stay under the main website's routing.

### Verified origin deployment (2026-10-09)

- `camp-origin.clev.io` resolves to `72.61.213.46` and has a valid Let's Encrypt certificate.
- `/camp` returns 200, `/camp/api/content` returns JSON, and 78 Camp assets return 200.
- Unauthenticated admin requests redirect to `/camp/login?from=%2Fcamp%2Fadmin`.
- The Nginx handoff snippet passed a two-hop container test for page, API, admin
  redirect and two asset samples; `/` and `/campus` stayed under homepage routing.
- The application container was unchanged. Previous routing files are backed up
  in `/opt/webclevio-backups/camp-origin-20261009/original`.
- The proxy snippet still needs installation by the team operating the new VPS.
