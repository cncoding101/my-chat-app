# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack AI chat application with three services:

- **app/** — React 19 + Vite 7 frontend
- **server/** — NestJS 11 backend (REST API + SSE streaming)
- **worker/** — Python FastAPI LLM worker with RAG support

Infrastructure: PostgreSQL (port 6000) and Qdrant vector DB, both via Docker.

## Development Commands

### Start Infrastructure

```bash
docker-compose up   # Start PostgreSQL & Qdrant
```

### App (Frontend) — `cd app`

```bash
npm run dev           # Dev server at http://localhost:5173
npm run build         # tsc -b && vite build
npm run lint          # ESLint
npm run lint:fix      # Fix ESLint issues
npm run format        # Prettier
npm run generate:api  # Regenerate TypeScript client from server OpenAPI spec
```

### Server (Backend) — `cd server`

```bash
npm run dev              # Dev server at http://localhost:3001
npm run build            # Compile TypeScript
npm run lint             # ESLint
npm run format           # Prettier
npm run bootstrap:db     # Run Prisma migrations + generate client
npm run export:openapi   # Export OpenAPI spec (required before generate:api in app/)
npm run generate:worker  # Regenerate worker client from worker OpenAPI spec
```

### Worker (Python) — `cd worker`

```bash
poe start    # uvicorn main:app --reload at http://localhost:8000
poe lint     # ruff check
poe format   # ruff format
poe check    # basedpyright type checking
poe openapi  # Export OpenAPI spec
```

## Architecture

### Code Generation Chain

Server and worker both expose OpenAPI specs. TypeScript clients are generated via Orval:

- `server/` exports spec → `app/` runs `generate:api` → updates `app/src/api/generated/server.client.ts`
- `worker/` exports spec → `server/` runs `generate:worker` → updates worker client in server

After changing server API contracts, always regenerate the app client.

### Frontend State

- **State**: local/UI state (chat messages, navbar)
- **React Query**: server state with caching
- **React Router 7**: URL-based routing (`/chat/:id`, `/documents`)

### Frontend Component Structure

`atoms` → `molecules` → `organisms` → `pages`. API calls live in `app/src/api/`.

### Worker Layered Architecture

The worker follows a strict `routers → controllers → business → services` dependency flow. Each layer may only import from layers below it — never upward.

| Layer | Folder | Responsibility | May import from |
|---|---|---|---|
| **Routers** | `routers/` | HTTP concerns: routes, FastAPI `Depends()`, request/response schemas | controllers, business (for type annotations), schemas, dependencies |
| **Controllers** | `controllers/` | Orchestration: coordinate business logic and services, handle errors | business, services, schemas |
| **Business** | `business/` | Core domain logic: agent loop, ingestion pipeline, retrieval, parsing, chunking | services, schemas, config |
| **Services** | `services/` | External I/O only: LLM APIs, embedding APIs, Qdrant, HTTP callbacks/fetches | config, external libraries |

Rules:
- **Services must never import from business, controllers, or routers**
- **Business must never import from controllers or routers**
- Stateful orchestrators (classes with injected dependencies) go in `business/` — e.g., `ChatService`, `IngestionService`, `Agent`
- Stateless pure functions (no dependencies) also go in `business/` — e.g., `parsers.py`, `chunker.py`
- Routers construct and return response schema objects; controllers return domain objects
- Singletons are created in `main.py` lifespan and injected via `dependencies.py`

### Worker LLM & Embedding Providers

Configured via environment variables. Supported providers:

- **LLM**: `gemini` (default: `gemini-2.0-flash-lite`), `ollama`, `mock`
- **Embeddings**: `gemini` (default: `text-embedding-004`), `ollama`

Both use a factory pattern — swap providers by changing `LLM_PROVIDER` / `EMBEDDING_PROVIDER` in `.env`.

### RAG Pipeline

Documents → chunking → embedding → Qdrant vector store → retrieval at query time. The worker exposes document ingestion endpoints used by the server's document module.

## Linting Notes

- ESLint config in `app/` and `server/` uses FlatConfig (`eslint.config.ts`)
- Generated files under `app/src/api/generated/` are excluded from linting
- Worker uses `ruff` (config in `worker/ruff.toml`, line length 100) and `basedpyright`

## Design System

See [DESIGNSYSTEM.md](./DESIGNSYSTEM.md) for the full token reference, Figma link, and usage rules.

Key points:

- `app/tokens.json` is the source of truth — edit tokens there, then run `npm run generate:tokens` to update `index.css`
- Never hardcode color values — use design tokens
- Use shadcn/ui components for all UI elements
- Check existing components before creating new ones
