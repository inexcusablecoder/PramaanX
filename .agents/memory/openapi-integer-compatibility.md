---
name: OpenAPI integer compatibility
description: Compatibility constraint between Orval's generated Zod schemas and the workspace's installed Zod runtime.
---

Use numeric OpenAPI schemas for count and limit fields while the workspace uses Zod 3; the current generator emits `z.int()` for OpenAPI integer types, which is unavailable in the installed runtime.

**Why:** Code generation succeeds, but the chained library typecheck fails on every generated `z.int()` call.

**How to apply:** If the workspace upgrades to Zod 4, re-evaluate integer schemas and remove the workaround only after codegen and the full library typecheck both pass.