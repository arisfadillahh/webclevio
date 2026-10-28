# Runtime and dependency security update

Based on the exact deployed e80b273f552542fb9912502bd41a81210345f96e source, not the divergent main branch. Preserve all deployed camp/navigation/content features. No business source, schema, environment, user data or migrations are changed.

Pin official multiarchitecture Node 22.23.4 Alpine image by digest in every Docker stage; patch compatible Next 16.4.2, Sharp 0.35.5 and React 19.2.9. This includes refreshed SVG/cache RCE and Server Action DoS advisories that still affect Next 16.3.8. Regenerate lock without force, test security helpers, typecheck and build; audit production dependencies. Do not forcibly downgrade lint tools to satisfy development-only audit findings.

Before recreation, preserve the original immutable image/container, root-only config, content data and uploaded assets. The historical container has writable data/uploads and no mounts: never replace it from a fresh image without copying/validating that state into persistent storage first. Preserve DB connection, networks, router aliases, restart policy, user and command. Never run content migration/seed for this runtime update. Stage on loopback with no public routing alias; only switch after smoke checks. Roll back the application/container on failure without reverting the database. Keep the old container and recovery files, not only its image.

Readiness checks must cover /camp, assets, public articles/events, login and protected content/upload APIs. Do not change real content, invoke admin writes, charge payments or send messages merely for QA. Report exact source SHA/image and residual verification gaps honestly.
