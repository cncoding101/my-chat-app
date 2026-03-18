# RAG Pipeline Improvements Plan

## Context

The current RAG pipeline does basic chunk-and-retrieve: documents are parsed, chunked (fixed or semantic), embedded, and stored in Qdrant. At query time, the agent's `search_knowledge_base` tool embeds the query, retrieves top-K chunks, and passes them as flat text to the LLM. This works for simple lookups but loses context for small documents, lacks surrounding context for matched chunks, treats all queries the same regardless of intent, and doesn't persist full text or raw files.

This plan addresses 6 improvements across 5 phases, ordered by dependency.

---

## Dependency Graph

```
Phase 1: Raw File & Full Text Storage (Improvement 6)
  ├──> Phase 2: Parent-Child Chunking + Context Expansion (Improvements 2 + 4)
  │      └──> Phase 3: Small Document Bypass (Improvement 1)
  └──> Phase 4: Query Intent Classification + Summaries (Improvement 5)
         └──> Phase 5: Two-Stage Retrieval / Map-Reduce (Improvement 3)
```

Phases 2 and 4 can be worked in parallel after Phase 1. Phase 5 requires both.

---

## Phase 1: Raw File & Full Text Storage

- [x] **Phase 1**

**Goal**: Persist parsed full text in PostgreSQL and raw files on disk so downstream phases can access them.

### 1.1 Prisma Schema Migration

- [x] **1.1 Prisma Schema Migration**

**File**: `server/prisma/schema.prisma`

Add to `Document` model:

- `fullText String? @db.Text` — parsed text content
- `summary String? @db.Text` — placeholder for Phase 4
- `wordCount Int?` — enables small-doc detection without re-parsing

All nullable for backward compatibility with existing rows.

Run: `cd server && npx prisma migrate dev --name add-document-fulltext`

### 1.2 Worker Ingestion Returns Full Text

- [x] **1.2 Worker Ingestion Returns Full Text**

**File**: `worker/business/rag/ingestion.py`

- Add `full_text: str` and `word_count: int` to `IngestResult` dataclass
- After parsing, compute `word_count = len(text.split())` and pass both through

### 1.3 Worker API Schema Update

- [x] **1.3 Worker API Schema Update**

**File**: `worker/schemas/documents.py`

- Add `full_text: str` and `word_count: int` to `DocumentResponse`

**File**: `worker/controllers/document_controller.py` — pass new fields from `IngestResult` to response

### 1.4 Server Stores Full Text & Raw File

- [x] **1.4 Server Stores Full Text & Raw File**

**File**: `server/src/document/document.service.ts`

- After worker response, write raw file to `uploads/{document_id}/{filename}`
- Save `fullText`, `wordCount` to Prisma

**File**: `server/src/document/document.repository.ts` — update `CreateDocumentParams`

**New file**: `server/src/document/document-storage.service.ts` — isolates file I/O for future S3 swap

### 1.5 Regenerate Clients

- [x] **1.5 Regenerate Clients**

```bash
cd worker && poe openapi
cd server && npm run generate:worker
cd server && npm run export:openapi
cd app && npm run generate:api
```

---

## Phase 2: Parent-Child Chunking & Context Window Expansion (Improvements 2 + 4)

- [x] **Phase 2 complete**

**Goal**: Index small chunks for retrieval precision, but store and return larger parent context. Improvements 2 and 4 merge here — #4 is the general pattern, #2 is a specific case.

### 2.1 Enriched Qdrant Payload

- [x] **2.1 Enriched Qdrant Payload**

**File**: `worker/services/rag/vector_store.py`

- Introduced `ChunkPayload` dataclass with `text`, `chunk_index`, `chunk_type`, `parent_text`, `parent_index`
- Introduced `Metadata` dataclass with `filename` (spread via `asdict()`)
- Updated `upsert_chunks()` to accept `list[ChunkPayload]` + `Metadata` instead of raw strings + dict
- Updated `search()` to return `parent_text`, `parent_index`, `chunk_type` in results

### 2.2 Parent-Child Chunker

- [x] **2.2 Parent-Child Chunker**

**New file**: `worker/business/rag/chunker/parent_child_chunker.py`

- `ParentChildChunker` wraps any child `ChunkerStrategy` (fixed or semantic) with a parent-level `FixedSizeChunker`
- Parent chunks: ~800 words, child chunks: determined by child strategy
- Factory always wraps the chosen strategy in `ParentChildChunker` — no separate `parent_child` strategy value
- All chunkers now return `list[ChunkResult]` (unified return type via ABC in `base.py`)

**Files also changed**: `factory.py`, `base.py` (`ChunkResult` dataclass), `fixed_chunker.py`, `semantic_chunker.py`, `__init__.py`

### 2.3 Ingestion Pipeline Update

- [x] **2.3 Ingestion Pipeline Update**

**File**: `worker/business/rag/ingestion.py`

- Unified code path: calls `chunk_text()` or `chunk_text_async()` (no `isinstance` check for `ParentChildChunker`)
- Converts `ChunkResult` → `ChunkPayload` with `document_id`, `filename`, `chunk_index` added from ingestion context
- Only child `text` gets embedded; `parent_text` is metadata only

### 2.4 Retriever Returns Parent Context

- [x] **2.4 Retriever Returns Parent Context**

**File**: `worker/business/rag/retriever.py`

- `search()` now calls `_deduplicate()` which returns `parent_text` when available
- Deduplication by `(document_id, parent_index)` to avoid returning the same parent multiple times

---

## Phase 3: Small Document Bypass (Improvement 1)

- [ ] **Phase 3 complete**

**Goal**: Documents under a word threshold skip chunking and are stored/returned as a single unit.

### 3.1 Settings

- [ ] **3.1 Settings**

**File**: `worker/config/settings.py` — add `SMALL_DOC_WORD_THRESHOLD: int = 2000`

### 3.2 Ingestion Bypass

- [ ] **3.2 Ingestion Bypass**

**File**: `worker/business/rag/ingestion.py`

After parsing, if `word_count <= threshold`:

- Store entire text as single chunk with `chunk_type='full'`
- Skip chunking entirely
- Embed the full text (truncate if exceeding embedding model limits)

No retriever changes needed — full-doc chunks are returned like any other match.

---

## Phase 4: Query Intent Classification + Document Summaries (Improvement 5)

- [ ] **Phase 4 complete**

**Goal**: Classify queries as broad vs. specific. Broad queries get document-level summaries; specific queries get targeted chunks.

### 4.1 Document Summarizer

- [ ] **4.1 Document Summarizer**

**New file**: `worker/business/rag/summarizer.py`

`DocumentSummarizer` class in business layer. Calls LLM provider to generate 2-3 paragraph summaries. Follows layered architecture (business calls service, not the reverse).

### 4.2 Summary Generation During Ingestion

- [ ] **4.2 Summary Generation During Ingestion**

**File**: `worker/business/rag/ingestion.py`

After chunking, if `GENERATE_SUMMARIES` is enabled:

- Generate summary via `DocumentSummarizer`
- Embed summary and store in Qdrant with `chunk_type='summary'`
- Return summary in `IngestResult` so server stores it in PostgreSQL `summary` column

**File**: `worker/config/settings.py` — add `GENERATE_SUMMARIES: bool = True`

### 4.3 Query Intent Classifier

- [ ] **4.3 Query Intent Classifier**

**New file**: `worker/business/rag/query_classifier.py`

`QueryClassifier` with `QueryIntent` enum: `SPECIFIC`, `BROAD`, `COMPARATIVE`. Uses a fast LLM call to classify the query.

### 4.4 RAG Tool Intent Routing

- [ ] **4.4 RAG Tool Intent Routing**

**File**: `worker/business/tools/rag_tool.py`

Updated `execute()` flow:

1. Classify query intent
2. `BROAD` → search summaries only (`chunk_type='summary'` filter)
3. `SPECIFIC` → existing chunk retrieval (with parent context from Phase 2)
4. `COMPARATIVE` → reserved for Phase 5

**File**: `worker/business/rag/retriever.py` — add `search_summaries(query)` method with Qdrant filter

### 4.5 Wiring

- [ ] **4.5 Wiring**

**Files**: `worker/main.py`, `worker/dependencies.py` — instantiate and inject `QueryClassifier`, `DocumentSummarizer`

---

## Phase 5: Two-Stage Retrieval / Map-Reduce (Improvement 3)

- [ ] **Phase 5 complete**

**Goal**: For complex queries, do coarse retrieval → fine-grained re-ranking → map-reduce summarization.

### 5.1 Two-Stage Retriever

- [ ] **5.1 Two-Stage Retriever**

**New file**: `worker/business/rag/two_stage_retriever.py`

`TwoStageRetriever` class:

1. **Coarse stage**: Retrieve top-K parent chunks via standard search
2. **Group by parent**: Identify unique document/parent groups
3. **Fine stage**: For each parent group, retrieve and re-rank child chunks
4. **Map**: Summarize each relevant section independently via LLM
5. **Reduce**: Synthesize final answer from section summaries

### 5.2 Integration

- [ ] **5.2 Integration**

**File**: `worker/business/tools/rag_tool.py` — route `COMPARATIVE` intent to two-stage retriever

**Files**: `worker/main.py`, `worker/config/settings.py` — add `TWO_STAGE_ENABLED`, `TWO_STAGE_COARSE_TOP_K` (20), `TWO_STAGE_FINE_TOP_K` (5)

---

## New Files Summary

| File                                                  | Phase |
| ----------------------------------------------------- | ----- |
| `server/src/document/document-storage.service.ts`     | 1     |
| `worker/business/rag/chunker/parent_child_chunker.py` | 2     |
| `worker/business/rag/summarizer.py`                   | 4     |
| `worker/business/rag/query_classifier.py`             | 4     |
| `worker/business/rag/two_stage_retriever.py`          | 5     |

## Most-Modified Files

- `worker/business/rag/ingestion.py` — Phases 1, 2, 3, 4
- `worker/services/rag/vector_store.py` — Phases 2, 4, 5
- `worker/business/rag/retriever.py` — Phases 2, 4
- `worker/business/tools/rag_tool.py` — Phases 4, 5
- `worker/config/settings.py` — Phases 1–5
- `worker/main.py` / `worker/dependencies.py` — Phases 4, 5

## Verification

After each phase:

1. **Lint & type-check**: `cd worker && poe lint && poe check`
2. **Regenerate clients**: `poe openapi` → `npm run generate:worker` → `npm run generate:api`
3. **Manual test**: Ingest a test document, verify new fields/payloads in Qdrant (via Qdrant dashboard at `:6333/dashboard`) and PostgreSQL
4. **Chat test**: Ask both broad and specific questions to verify retrieval routing
