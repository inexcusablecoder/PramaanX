# PramaanX

PramaanX is an enterprise operations command center for document verification, workforce credentials, asset custody, risk intelligence, and audit visibility.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/pramaanx` — React + Vite web app and the primary user experience
- `artifacts/api-server/src/routes/pramaanx.ts` — first-pass typed operations API and seeded demo domain
- `lib/api-spec/openapi.yaml` — source of truth for dashboard, verification, workforce, assets, and activity contracts
- `lib/api-client-react/src/generated` — generated React Query client and schemas; regenerate from OpenAPI
- `artifacts/pramaanx/src/index.css` — PramaanX theme tokens and global visual rules

## Architecture decisions

- The first build uses a deterministic in-memory demo domain behind the typed API so the full product loop is usable before persistence and model integrations are introduced.
- OpenAPI is the single contract for frontend hooks and server validation; do not hand-write a parallel client shape.
- Verification mutations update the same live domain used by dashboard, queue, and activity views so the UI reflects actions immediately after refetch/invalidation.
- The first frontend prioritizes the command-center workflow from the hackathon brief; OCR, neural forensics, telemetry, auth, and persistence are extension points behind these stable surfaces.

## Product

- Command center: verification throughput, workforce coverage, asset custody, trust index, processing trend, risk posture, and recent activity
- Verification queue: search/filter incoming evidence, inspect extracted fields and signals, verify or escalate records, and add a document to the pipeline
- Workforce assurance: review credential status, trust score, organization, and expiry risk
- Asset custody: inspect latest locations and custody state, with CSV export for operations handoff
- Audit activity: review recent verification, risk, workforce, and telemetry events

## User preferences

No persistent user preferences recorded.

## Gotchas

- The generated Zod client currently targets the workspace's Zod 3 runtime; OpenAPI integer schemas produce `z.int()` and fail typechecking, so count/limit fields use numeric schemas until the workspace upgrades Zod.
- Artifact builds require workflow-provided `PORT` and `BASE_PATH`; use the managed web workflow or provide both values for a standalone build.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
