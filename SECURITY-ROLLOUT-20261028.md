# Security follow-up, 28 October 2026

Preserve the exact deployed e80b273f552542fb9912502bd41a81210345f96e feature history. This follows security commit bacd05574f53614d63b9999118f0bdbc6d36fe0f; do not replace the deployed website with divergent main.

Pin Zod 4.6.7 within the existing major to address GHSA-mrhx-c7xc-m3w5. Keep the patched Next/React/Sharp versions and pinned official Node 22.23.4 Docker image from the preceding commit. Regenerate the lock without force or lifecycle scripts. Initial production dependency audit is clear; repeat tests, TypeScript, build and audit in the isolated image before activation.

No business code, schema, migration or issued content is changed. Preserve the existing runtime environment privately. The legacy container has writable content/uploads without external mounts: capture them, cold-copy final state into persistent mounts after draining/stopping, and retain the old container/config as recovery evidence. Rollback must use the same new persistent mounts so that writes made after cutover are not discarded. Never automatically restore an older database or trigger real admin writes/messages for QA.
