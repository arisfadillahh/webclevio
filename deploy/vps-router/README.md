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

If the domain's DNS is moved to another server, that server must reverse proxy
`/camp` and `/camp/...` to the Clevio VPS while preserving the path and the
`Host: clev.io` header. A DNS record cannot split one domain by URL path.
