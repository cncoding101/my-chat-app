# 🎓 Learning Roadmap: Building a Minified RAG System

*Based on the Worker Compass architecture*

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [What You'll Build](#-what-youll-build)
- [Learning Roadmap](#-learning-roadmap)
- [Essential Tech Stack](#-essential-tech-stack)
- [Project Structure](#-simplified-project-structure)
- [Development Milestones](#-development-milestones)
- [Learning Resources](#-recommended-learning-resources)
- [Success Criteria](#-success-criteria)

---

## 🎯 Project Overview

**Worker Compass** is a sophisticated RAG (Retrieval Augmented Generation) system designed for medical document analysis. It features:

- **PDF Processing Pipeline**: Extracts and processes medical documents
- **Vector Search**: Semantic search using embeddings and Qdrant
- **Agentic AI Architecture**: Tool-calling agent with function execution
- **Multi-document Analysis**: Compare and synthesize information across documents
- **Citation System**: Track sources with chunk-level precision
- **Analytics Dashboard**: User activity and sentiment analysis
- **Multi-client Architecture**: Runs on Google Cloud Run with project-based secret management

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Worker Compass System                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PDF Upload → Text Extraction → Chunking → Embeddings       │
│                          ↓                                   │
│                   Vector Database (Qdrant)                   │
│                          ↓                                   │
│  User Query → Agent (Tools) → RAG → LLM → Cited Response    │
│                          ↓                                   │
│              Analytics & Dashboard Generation                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 What You'll Build

A **minified RAG system** that includes:

### Core Features
- ✅ PDF document upload and processing
- ✅ Text extraction and intelligent chunking
- ✅ Vector embeddings and semantic search
- ✅ Question answering with source citations
- ✅ Multi-document support
- ✅ RESTful API with FastAPI
- ✅ Simple web interface

### Optional Advanced Features
- 🔧 Agentic architecture with tool calling
- 🔧 Conversation history and multi-turn chat
- 🔧 Document comparison capabilities
- 🔧 Analytics and usage tracking

---

## 🗺️ Learning Roadmap

### Phase 1: Fundamentals (2-3 weeks)

#### 1.1 Python Essentials

**Topics to Master:**
- Async programming (`asyncio`, `async/await`)
- Type hints and Pydantic models
- Environment variables (`.env` files, `python-dotenv`)
- Error handling and logging (`loguru`)
- Context managers and decorators

**Practice Project:** 
Build an async web scraper that:
- Fetches multiple URLs concurrently
- Validates data with Pydantic
- Logs errors with loguru
- Loads config from `.env`

**Resources:**
- [Real Python - Async IO](https://realpython.com/async-io-python/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Loguru Documentation](https://loguru.readthedocs.io/)

#### 1.2 API Development with FastAPI

**Topics to Master:**
- REST API principles and design
- FastAPI routing and path operations
- Request/response models with Pydantic
- Background tasks
- Dependency injection
- Request validation and error handling
- API documentation (Swagger/OpenAPI)

**Practice Project:**
Build a Todo API with:
- CRUD operations (Create, Read, Update, Delete)
- Input validation
- Background email notifications
- SQLite persistence
- Automatic API docs

**Resources:**
- [FastAPI Official Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)

**Example Code:**
```python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel

app = FastAPI()

class TodoItem(BaseModel):
    title: str
    description: str | None = None
    completed: bool = False

@app.post("/todos")
async def create_todo(todo: TodoItem, background_tasks: BackgroundTasks):
    # Process todo
    background_tasks.add_task(send_notification, todo.title)
    return {"status": "created", "todo": todo}
```

---

### Phase 2: Core RAG Components (3-4 weeks)

#### 2.1 Working with LLMs

**Topics to Master:**
- OpenAI API basics (chat completions, embeddings)
- Prompt engineering fundamentals
- Token counting and cost management
- Streaming responses
- Function calling / Tool use
- Temperature and other parameters

**Framework:** `openai` Python library (v1.0+)

**Practice Project:**
Build a chatbot that can:
- Maintain conversation history
- Call external functions (weather API, calculator)
- Stream responses token-by-token
- Track token usage and costs

**Key Concepts:**
```python
from openai import OpenAI

client = OpenAI()

# Chat completion
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What's the weather?"}
    ],
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                }
            }
        }
    }]
)
```

**Resources:**
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

#### 2.2 Vector Databases & Embeddings

**Topics to Master:**
- What are embeddings? (vector representations of text)
- Semantic search vs keyword search
- Vector similarity metrics (cosine, dot product, euclidean)
- Creating and storing embeddings
- Chunking strategies for optimal retrieval

**Technology Options:**
- **Recommended:** Qdrant (same as Worker Compass)
- **Alternative:** ChromaDB (simpler, embedded)
- **Cloud:** Pinecone, Weaviate

**Practice Project:**
Create a simple Q&A system:
1. Take 10 text documents
2. Convert them to embeddings
3. Store in vector database
4. Implement semantic search
5. Return top 3 most relevant chunks

**Example Code:**
```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# Initialize Qdrant
client = QdrantClient("localhost", port=6333)

# Create collection
client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)

# Add documents
points = [
    PointStruct(
        id=idx,
        vector=embedding,
        payload={"text": text, "doc_id": doc_id}
    )
    for idx, (embedding, text, doc_id) in enumerate(documents)
]
client.upsert(collection_name="documents", points=points)

# Search
results = client.search(
    collection_name="documents",
    query_vector=query_embedding,
    limit=5
)
```

**Setup Qdrant with Docker:**
```bash
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage \
    qdrant/qdrant
```

**Resources:**
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Understanding Embeddings](https://platform.openai.com/docs/guides/embeddings)

#### 2.3 PDF Processing

**Topics to Master:**
- PDF text extraction techniques
- Handling different PDF formats (text-based, scanned)
- Image extraction from PDFs
- Page-by-page processing
- Metadata extraction

**Libraries:**
- `pypdf` - PDF text extraction
- `pdf2image` - Convert PDFs to images
- `poppler-utils` - System dependency for PDF operations
- `Pillow` - Image processing

**Practice Project:**
Build a PDF text extractor that:
- Accepts a PDF file
- Extracts text page-by-page
- Handles both text and image-based PDFs
- Returns structured data with page numbers
- Extracts metadata (author, title, page count)

**Example Code:**
```python
from pypdf import PdfReader
import subprocess

def extract_pdf_text(pdf_path: str) -> dict:
    """Extract text from PDF file."""
    reader = PdfReader(pdf_path)
    
    result = {
        "page_count": len(reader.pages),
        "metadata": reader.metadata,
        "pages": []
    }
    
    for page_num, page in enumerate(reader.pages, 1):
        text = page.extract_text()
        result["pages"].append({
            "page_number": page_num,
            "text": text,
            "char_count": len(text)
        })
    
    return result

# Check if PDF is text-based or scanned
def is_text_pdf(pdf_path: str, min_pages: int = 3) -> bool:
    """Check if PDF contains extractable text."""
    reader = PdfReader(pdf_path)
    pages_to_check = min(min_pages, len(reader.pages))
    
    for page in reader.pages[:pages_to_check]:
        text = page.extract_text()
        if len(text.strip()) < 50:  # Threshold
            return False
    return True
```

**System Setup:**
```bash
# macOS
brew install poppler

# Ubuntu/Debian
apt-get install poppler-utils

# Verify installation
which pdftotext pdfinfo
```

**Resources:**
- [pypdf Documentation](https://pypdf.readthedocs.io/)
- [pdf2image Documentation](https://github.com/Belval/pdf2image)

#### 2.4 Text Chunking Strategies

**Topics to Master:**
- Why chunking matters for RAG
- Fixed-size vs semantic chunking
- Overlap strategies
- Preserving context across chunks
- Metadata preservation

**Chunking Strategies:**

1. **Fixed-size chunking** (simple, predictable)
   - Split by token count (e.g., 500 tokens)
   - Add overlap (e.g., 50 tokens)
   
2. **Sentence-based chunking** (better context)
   - Split on sentence boundaries
   - Combine sentences until token limit
   
3. **Semantic chunking** (best quality, slower)
   - Use LLM to identify logical sections
   - Preserve topic coherence

**Practice Project:**
Experiment with different chunking strategies:
- Implement all three approaches
- Test on a long document (20+ pages)
- Compare retrieval quality
- Measure performance trade-offs

**Example Code:**
```python
import tiktoken

def chunk_text_fixed(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """Split text into fixed-size chunks with overlap."""
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)
    
    chunks = []
    start = 0
    
    while start < len(tokens):
        end = start + chunk_size
        chunk_tokens = tokens[start:end]
        chunk_text = encoding.decode(chunk_tokens)
        chunks.append(chunk_text)
        start += chunk_size - overlap
    
    return chunks

def chunk_text_sentences(text: str, max_tokens: int = 500) -> list[str]:
    """Split text by sentences, combining until token limit."""
    import re
    
    # Simple sentence splitter
    sentences = re.split(r'(?<=[.!?])\s+', text)
    encoding = tiktoken.get_encoding("cl100k_base")
    
    chunks = []
    current_chunk = []
    current_tokens = 0
    
    for sentence in sentences:
        sentence_tokens = len(encoding.encode(sentence))
        
        if current_tokens + sentence_tokens > max_tokens and current_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
            current_tokens = sentence_tokens
        else:
            current_chunk.append(sentence)
            current_tokens += sentence_tokens
    
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    
    return chunks
```

**Resources:**
- [LangChain Text Splitters](https://python.langchain.com/docs/modules/data_connection/document_transformers/)
- [Chunking Strategies Guide](https://www.pinecone.io/learn/chunking-strategies/)

---

### Phase 3: Building the Mini RAG System (4-5 weeks)

#### 3.1 Document Ingestion Pipeline

**Architecture:**
```
PDF Upload → Extract Text → Chunk → Generate Embeddings → Store in Vector DB
     ↓            ↓            ↓              ↓                    ↓
  FastAPI    pypdf/      tiktoken       OpenAI API           Qdrant
  endpoint   poppler     chunking       embeddings          collection
```

**Components to Build:**

1. **Upload Endpoint** - Accept PDF files
2. **Text Extraction** - Extract text using `pypdf`
3. **Chunking Logic** - Split into manageable chunks
4. **Embedding Generation** - Create vectors with OpenAI
5. **Vector Storage** - Save to Qdrant with metadata
6. **Status Tracking** - Monitor processing status

**API Endpoints:**
```python
POST /upload              # Upload and process PDF
GET /documents            # List all processed documents
GET /documents/{id}       # Get document details
DELETE /documents/{id}    # Remove document and vectors
GET /documents/{id}/status # Check processing status
```

**Implementation Example:**
```python
from fastapi import FastAPI, UploadFile, BackgroundTasks
from pydantic import BaseModel
import uuid

app = FastAPI()

class DocumentStatus(BaseModel):
    id: str
    filename: str
    status: str  # "processing", "completed", "failed"
    page_count: int | None = None
    chunk_count: int | None = None

@app.post("/upload")
async def upload_document(
    file: UploadFile,
    background_tasks: BackgroundTasks
):
    """Upload and process a PDF document."""
    doc_id = str(uuid.uuid4())
    
    # Save file temporarily
    file_path = f"/tmp/{doc_id}.pdf"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Process in background
    background_tasks.add_task(process_document, doc_id, file_path, file.filename)
    
    return {
        "document_id": doc_id,
        "status": "processing",
        "message": "Document uploaded and processing started"
    }

async def process_document(doc_id: str, file_path: str, filename: str):
    """Background task to process document."""
    try:
        # 1. Extract text
        text_data = extract_pdf_text(file_path)
        
        # 2. Chunk text
        chunks = chunk_text(text_data["text"])
        
        # 3. Generate embeddings
        embeddings = await generate_embeddings(chunks)
        
        # 4. Store in vector DB
        await store_chunks(doc_id, chunks, embeddings, filename)
        
        # 5. Update status
        update_document_status(doc_id, "completed", len(chunks))
        
    except Exception as e:
        logger.error(f"Failed to process document {doc_id}: {e}")
        update_document_status(doc_id, "failed", 0)
```

**Database Schema:**
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT NOW(),
    page_count INTEGER,
    chunk_count INTEGER,
    status VARCHAR(50),
    metadata JSONB
);

CREATE TABLE chunks (
    id SERIAL PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,
    page_number INTEGER,
    vector_id VARCHAR(100),  -- Reference to Qdrant point ID
    UNIQUE(document_id, chunk_index)
);
```

#### 3.2 Query & Retrieval System

**Architecture:**
```
User Query → Generate Embedding → Vector Search → Retrieve Top K → Rerank → Return
```

**Components to Build:**

1. **Query Endpoint** - Accept user questions
2. **Query Embedding** - Convert query to vector
3. **Similarity Search** - Find relevant chunks in Qdrant
4. **Score Filtering** - Apply cutoff threshold
5. **Reranking** (optional) - Improve relevance
6. **Context Assembly** - Format chunks for LLM

**API Endpoint:**
```python
from typing import List

class SearchResult(BaseModel):
    chunk_id: int
    document_id: str
    document_name: str
    content: str
    score: float
    page_number: int | None
    chunk_index: int

class SearchRequest(BaseModel):
    query: str
    document_ids: List[str] | None = None  # Filter by specific docs
    top_k: int = 5
    score_threshold: float = 0.7

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_found: int

@app.post("/search", response_model=SearchResponse)
async def search_documents(request: SearchRequest):
    """Search for relevant document chunks."""
    
    # Generate query embedding
    query_embedding = await generate_embedding(request.query)
    
    # Build Qdrant filter
    filters = None
    if request.document_ids:
        filters = {
            "must": [
                {"key": "document_id", "match": {"any": request.document_ids}}
            ]
        }
    
    # Search vector database
    search_results = qdrant_client.search(
        collection_name="documents",
        query_vector=query_embedding,
        limit=request.top_k,
        score_threshold=request.score_threshold,
        query_filter=filters
    )
    
    # Format results
    results = []
    for hit in search_results:
        results.append(SearchResult(
            chunk_id=hit.payload["chunk_id"],
            document_id=hit.payload["document_id"],
            document_name=hit.payload["document_name"],
            content=hit.payload["text"],
            score=hit.score,
            page_number=hit.payload.get("page_number"),
            chunk_index=hit.payload["chunk_index"]
        ))
    
    return SearchResponse(
        query=request.query,
        results=results,
        total_found=len(results)
    )
```

**Optimization Tips:**
- Cache embeddings for common queries
- Use batch embedding generation for multiple queries
- Implement query expansion for better recall
- Add metadata filtering (date range, document type)

#### 3.3 RAG Response Generation

**Architecture:**
```
User Query + Retrieved Contexts → Build Prompt → LLM → Parse Response → Add Citations
```

**Components to Build:**

1. **Prompt Template** - System prompt + context injection
2. **LLM Call** - OpenAI chat completion
3. **Citation Tracking** - Map answer to source chunks
4. **Response Formatting** - Return answer with sources
5. **Error Handling** - Handle API failures gracefully

**Prompt Template:**
```python
RAG_SYSTEM_PROMPT = """You are a helpful AI assistant that answers questions based on provided context.

INSTRUCTIONS:
1. Answer the question using ONLY information from the provided context
2. If the context doesn't contain enough information, say so clearly
3. Cite sources using [cite:doc_id,chunk_idx] format
4. Be concise and accurate
5. If multiple sources support a claim, cite all of them

CONTEXT:
{context}

USER QUESTION:
{question}

Provide a well-structured answer with proper citations."""

def build_rag_prompt(query: str, search_results: List[SearchResult]) -> str:
    """Build prompt with context and query."""
    context = ""
    for idx, result in enumerate(search_results):
        context += f"\n[Document: {result.document_name}, Chunk {result.chunk_index}]\n"
        context += f"{result.content}\n"
        context += f"---\n"
    
    return RAG_SYSTEM_PROMPT.format(context=context, question=query)
```

**Chat Endpoint:**
```python
class ChatRequest(BaseModel):
    question: str
    document_ids: List[str] | None = None
    max_tokens: int = 500
    temperature: float = 0.1

class Citation(BaseModel):
    document_id: str
    document_name: str
    chunk_index: int
    page_number: int | None
    content: str

class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation]
    sources_used: int
    total_tokens: int

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Answer questions using RAG."""
    
    # 1. Retrieve relevant context
    search_request = SearchRequest(
        query=request.question,
        document_ids=request.document_ids,
        top_k=5,
        score_threshold=0.7
    )
    search_response = await search_documents(search_request)
    
    if not search_response.results:
        return ChatResponse(
            answer="I couldn't find any relevant information to answer your question.",
            citations=[],
            sources_used=0,
            total_tokens=0
        )
    
    # 2. Build prompt
    prompt = build_rag_prompt(request.question, search_response.results)
    
    # 3. Generate response
    completion = openai_client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": request.question}
        ],
        max_tokens=request.max_tokens,
        temperature=request.temperature
    )
    
    answer = completion.choices[0].message.content
    
    # 4. Extract citations
    citations = []
    for result in search_response.results:
        citations.append(Citation(
            document_id=result.document_id,
            document_name=result.document_name,
            chunk_index=result.chunk_index,
            page_number=result.page_number,
            content=result.content
        ))
    
    return ChatResponse(
        answer=answer,
        citations=citations,
        sources_used=len(citations),
        total_tokens=completion.usage.total_tokens
    )
```

**Citation Parsing:**
```python
import re

def parse_citations(answer: str) -> List[tuple[str, int]]:
    """Extract [cite:doc_id,chunk_idx] from answer."""
    pattern = r'\[cite:([^,]+),(\d+)\]'
    citations = re.findall(pattern, answer)
    return [(doc_id, int(chunk_idx)) for doc_id, chunk_idx in citations]

def validate_citations(answer: str, available_chunks: List[SearchResult]) -> bool:
    """Check if all citations reference available chunks."""
    citations = parse_citations(answer)
    available = {(r.document_id, r.chunk_index) for r in available_chunks}
    
    for doc_id, chunk_idx in citations:
        if (doc_id, chunk_idx) not in available:
            return False
    return True
```

#### 3.4 Simple Agent System (Optional Advanced)

**Minified Agent Architecture:**
```
User Query → Agent → [Tool Selection] → Tool Execution → Agent → Response
                ↓                            ↓
           Decision Loop              [search_documents]
                                      [get_document_info]
```

**Tools to Implement:**

1. **search_documents** - Semantic search across documents
2. **get_document_info** - Retrieve metadata about specific documents
3. **read_document_section** (optional) - Read specific pages

**Agent Implementation:**
```python
AGENT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_documents",
            "description": "Search for information across all documents using semantic search",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query"
                    },
                    "document_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Optional list of document IDs to search"
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "Number of results to return (default: 5)"
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_document_info",
            "description": "Get metadata about available documents",
            "parameters": {
                "type": "object",
                "properties": {
                    "document_id": {
                        "type": "string",
                        "description": "Specific document ID, or leave empty for all"
                    }
                }
            }
        }
    }
]

async def execute_tool(tool_name: str, arguments: dict) -> dict:
    """Execute a tool and return results."""
    if tool_name == "search_documents":
        search_request = SearchRequest(**arguments)
        result = await search_documents(search_request)
        return {
            "results": [r.dict() for r in result.results],
            "count": result.total_found
        }
    
    elif tool_name == "get_document_info":
        doc_id = arguments.get("document_id")
        # Query database for document info
        docs = get_documents(doc_id)
        return {"documents": [d.dict() for d in docs]}
    
    else:
        return {"error": f"Unknown tool: {tool_name}"}

async def run_agent(query: str, max_iterations: int = 3) -> ChatResponse:
    """Run agent loop with tool calling."""
    messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant with access to document search tools. "
                      "Use the available tools to find information before answering."
        },
        {"role": "user", "content": query}
    ]
    
    all_citations = []
    
    for iteration in range(max_iterations):
        # Call LLM with tools
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            tools=AGENT_TOOLS,
            tool_choice="auto"
        )
        
        message = response.choices[0].message
        messages.append(message.dict())
        
        # Check if agent wants to call tools
        if message.tool_calls:
            # Execute each tool call
            for tool_call in message.tool_calls:
                function_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)
                
                # Execute tool
                tool_result = await execute_tool(function_name, arguments)
                
                # Track citations
                if function_name == "search_documents" and "results" in tool_result:
                    all_citations.extend(tool_result["results"])
                
                # Add tool response to messages
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(tool_result)
                })
        else:
            # Agent provided final answer
            return ChatResponse(
                answer=message.content,
                citations=[Citation(**c) for c in all_citations],
                sources_used=len(all_citations),
                total_tokens=response.usage.total_tokens
            )
    
    # Max iterations reached
    return ChatResponse(
        answer="I couldn't complete the task within the allowed iterations.",
        citations=[],
        sources_used=0,
        total_tokens=0
    )
```

---

### Phase 4: Storage & Persistence (1-2 weeks)

#### 4.1 Database Setup

**Development: SQLite**
```python
import sqlite3
from contextlib import contextmanager

@contextmanager
def get_db_connection():
    """Get database connection with context manager."""
    conn = sqlite3.connect("mini_rag.db")
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

def init_database():
    """Initialize database schema."""
    with get_db_connection() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                page_count INTEGER,
                chunk_count INTEGER,
                status TEXT,
                metadata TEXT
            );
            
            CREATE TABLE IF NOT EXISTS chunks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id TEXT NOT NULL,
                chunk_index INTEGER NOT NULL,
                content TEXT NOT NULL,
                token_count INTEGER,
                page_number INTEGER,
                vector_id TEXT,
                FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
                UNIQUE(document_id, chunk_index)
            );
            
            CREATE INDEX IF NOT EXISTS idx_document_id ON chunks(document_id);
            CREATE INDEX IF NOT EXISTS idx_vector_id ON chunks(vector_id);
        """)
```

**Production: PostgreSQL**
```python
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

DATABASE_URL = "postgresql://user:password@localhost:5432/mini_rag"

@contextmanager
def get_db_connection():
    """Get PostgreSQL connection."""
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

def init_database():
    """Initialize PostgreSQL schema."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id UUID PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    upload_date TIMESTAMP DEFAULT NOW(),
                    page_count INTEGER,
                    chunk_count INTEGER,
                    status VARCHAR(50),
                    metadata JSONB
                );
                
                CREATE TABLE IF NOT EXISTS chunks (
                    id SERIAL PRIMARY KEY,
                    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
                    chunk_index INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    token_count INTEGER,
                    page_number INTEGER,
                    vector_id VARCHAR(100),
                    UNIQUE(document_id, chunk_index)
                );
                
                CREATE INDEX IF NOT EXISTS idx_document_id ON chunks(document_id);
                CREATE INDEX IF NOT EXISTS idx_vector_id ON chunks(vector_id);
            """)
```

#### 4.2 Vector Database

**Option 1: Qdrant (Recommended)**

Docker setup:
```bash
# Run Qdrant in Docker
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

Python client:
```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

def init_qdrant():
    """Initialize Qdrant collection."""
    client = QdrantClient(host="localhost", port=6333)
    
    # Create collection if it doesn't exist
    collections = client.get_collections().collections
    if "documents" not in [c.name for c in collections]:
        client.create_collection(
            collection_name="documents",
            vectors_config=VectorParams(
                size=1536,  # OpenAI embedding dimension
                distance=Distance.COSINE
            )
        )
    
    return client

def store_embeddings(client: QdrantClient, chunks: List[dict]):
    """Store chunk embeddings in Qdrant."""
    points = []
    for chunk in chunks:
        points.append(PointStruct(
            id=chunk["vector_id"],
            vector=chunk["embedding"],
            payload={
                "document_id": chunk["document_id"],
                "document_name": chunk["document_name"],
                "chunk_index": chunk["chunk_index"],
                "text": chunk["text"],
                "page_number": chunk.get("page_number"),
                "chunk_id": chunk["chunk_id"]
            }
        ))
    
    client.upsert(
        collection_name="documents",
        points=points,
        wait=True
    )
```

**Option 2: ChromaDB (Simpler)**

Setup:
```bash
pip install chromadb
```

Python client:
```python
import chromadb
from chromadb.config import Settings

def init_chromadb():
    """Initialize ChromaDB."""
    client = chromadb.Client(Settings(
        chroma_db_impl="duckdb+parquet",
        persist_directory="./chroma_storage"
    ))
    
    collection = client.get_or_create_collection(
        name="documents",
        metadata={"hnsw:space": "cosine"}
    )
    
    return client, collection

def store_embeddings(collection, chunks: List[dict]):
    """Store chunk embeddings in ChromaDB."""
    collection.add(
        ids=[str(c["vector_id"]) for c in chunks],
        embeddings=[c["embedding"] for c in chunks],
        documents=[c["text"] for c in chunks],
        metadatas=[{
            "document_id": c["document_id"],
            "document_name": c["document_name"],
            "chunk_index": c["chunk_index"],
            "page_number": c.get("page_number")
        } for c in chunks]
    )
```

---

### Phase 5: Frontend & UI (2-3 weeks)

#### 5.1 Simple Web Interface

**Option 1: Streamlit (Easiest)**

Perfect for quick prototypes:
```python
import streamlit as st
import requests

API_URL = "http://localhost:8000"

st.title("📚 Mini RAG System")

# Sidebar for document upload
with st.sidebar:
    st.header("Upload Documents")
    uploaded_file = st.file_uploader("Choose a PDF", type="pdf")
    
    if uploaded_file and st.button("Upload"):
        files = {"file": uploaded_file}
        response = requests.post(f"{API_URL}/upload", files=files)
        if response.ok:
            st.success("Document uploaded!")
        else:
            st.error("Upload failed")
    
    # Show documents
    st.header("Documents")
    docs_response = requests.get(f"{API_URL}/documents")
    if docs_response.ok:
        docs = docs_response.json()
        for doc in docs:
            st.text(f"📄 {doc['filename']}")

# Main chat interface
st.header("Ask Questions")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        if "citations" in message:
            with st.expander("📚 Sources"):
                for citation in message["citations"]:
                    st.text(f"• {citation['document_name']} (p. {citation.get('page_number', '?')})")

# Chat input
if prompt := st.chat_input("What would you like to know?"):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Get AI response
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            response = requests.post(
                f"{API_URL}/chat",
                json={"question": prompt}
            )
            
            if response.ok:
                data = response.json()
                answer = data["answer"]
                citations = data["citations"]
                
                st.markdown(answer)
                
                with st.expander("📚 Sources"):
                    for citation in citations:
                        st.text(f"• {citation['document_name']} (p. {citation.get('page_number', '?')})")
                
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": answer,
                    "citations": citations
                })
```

Run with:
```bash
streamlit run app.py
```

**Option 2: React + TypeScript (More Control)**

Basic structure:
```typescript
// src/App.tsx
import { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';

function App() {
  const [documents, setDocuments] = useState([]);
  
  return (
    <div className="app">
      <aside>
        <DocumentUpload onUpload={() => fetchDocuments()} />
        <DocumentList documents={documents} />
      </aside>
      <main>
        <ChatInterface documents={documents} />
      </main>
    </div>
  );
}

// src/components/ChatInterface.tsx
interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

function ChatInterface({ documents }: { documents: Document[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  const sendMessage = async () => {
    const newMessage: Message = { role: 'user', content: input };
    setMessages([...messages, newMessage]);
    
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: input })
    });
    
    const data = await response.json();
    setMessages([...messages, newMessage, {
      role: 'assistant',
      content: data.answer,
      citations: data.citations
    }]);
    
    setInput('');
  };
  
  return (
    <div className="chat">
      <div className="messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
      </div>
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
    </div>
  );
}
```

**Option 3: HTML + HTMX (Lightweight)**

Simple and fast:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Mini RAG</title>
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
    <style>
        .chat-container { max-width: 800px; margin: 0 auto; }
        .message { padding: 10px; margin: 10px 0; border-radius: 8px; }
        .user { background: #e3f2fd; }
        .assistant { background: #f5f5f5; }
        .citation { font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="chat-container">
        <h1>📚 Mini RAG System</h1>
        
        <!-- Upload form -->
        <form hx-post="/upload" hx-encoding="multipart/form-data">
            <input type="file" name="file" accept=".pdf">
            <button type="submit">Upload</button>
        </form>
        
        <!-- Chat area -->
        <div id="messages"></div>
        
        <!-- Input form -->
        <form hx-post="/chat" hx-target="#messages" hx-swap="beforeend">
            <input name="question" placeholder="Ask a question...">
            <button type="submit">Send</button>
        </form>
    </div>
</body>
</html>
```

---

### Phase 6: Deployment (1-2 weeks)

#### 6.1 Containerization

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - QDRANT_HOST=qdrant
      - QDRANT_PORT=6333
      - DATABASE_URL=postgresql://user:password@db:5432/minirag
    depends_on:
      - qdrant
      - db
    volumes:
      - ./uploads:/app/uploads

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_storage:/qdrant/storage

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: minirag
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  qdrant_storage:
  postgres_data:
```

Build and run:
```bash
# Build
docker-compose build

# Run
docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

#### 6.2 Cloud Deployment

**Option 1: Render.com (Easiest)**

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: mini-rag-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: OPENAI_API_KEY
        sync: false
      - key: QDRANT_URL
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: mini-rag-db
          property: connectionString

databases:
  - name: mini-rag-db
    plan: starter
```

2. Connect GitHub repo
3. Deploy automatically on push

**Option 2: Railway.app**

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Deploy:
```bash
railway login
railway init
railway up
```

3. Add environment variables in dashboard

**Option 3: Google Cloud Run (Production)**

Build and deploy:
```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Build container
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/mini-rag

# Deploy to Cloud Run
gcloud run deploy mini-rag \
  --image gcr.io/YOUR_PROJECT_ID/mini-rag \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=your-key
```

**Option 4: AWS Lambda + API Gateway**

Use Mangum adapter:
```python
from mangum import Mangum
from fastapi import FastAPI

app = FastAPI()

# ... your endpoints ...

# Lambda handler
handler = Mangum(app)
```

Deploy with Serverless Framework or SAM.

---

## 🛠️ Essential Tech Stack

### Backend Core
```
Python 3.10+
├── FastAPI          # Web framework
├── Pydantic         # Data validation
├── python-dotenv    # Environment variables
├── loguru           # Logging
└── uvicorn          # ASGI server
```

### AI/ML
```
openai              # OpenAI API client
tiktoken            # Token counting
tenacity            # Retry logic
```

### Vector Search
```
qdrant-client       # Vector database client
# OR
chromadb            # Alternative embedded DB
```

### PDF Processing
```
pypdf               # PDF text extraction
pdf2image           # PDF to images
Pillow              # Image processing
poppler-utils       # System dependency
```

### Database
```
Development:
  sqlite3           # Built into Python

Production:
  psycopg2-binary   # PostgreSQL client
  sqlalchemy        # ORM (optional)
```

### Frontend Options
```
Option 1: streamlit              # Python-based UI (easiest)
Option 2: React + TypeScript     # Full SPA
Option 3: HTML + HTMX           # Lightweight
```

### Deployment
```
Docker              # Containerization
docker-compose      # Local orchestration
gunicorn            # Production server (optional)
```

---

## 📁 Simplified Project Structure

```
mini-rag/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app and endpoints
│   ├── models.py               # Pydantic models
│   ├── config.py               # Configuration
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── pdf_processor.py   # PDF handling
│   │   ├── embeddings.py      # Embedding generation
│   │   ├── vector_store.py    # Vector DB interface
│   │   ├── retriever.py       # Search logic
│   │   └── generator.py       # LLM response generation
│   │
│   ├── database/
│   │   ├── __init__.py
│   │   ├── db.py              # Database connection
│   │   └── models.py          # Database models
│   │
│   └── utils/
│       ├── __init__.py
│       ├── chunking.py        # Text chunking utilities
│       └── citations.py       # Citation parsing
│
├── frontend/                   # Optional: separate frontend
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── tests/
│   ├── test_api.py
│   ├── test_retrieval.py
│   └── test_generation.py
│
├── scripts/
│   └── init_db.py             # Database initialization
│
├── .env.example               # Example environment variables
├── .gitignore
├── requirements.txt           # Python dependencies
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🚀 Development Milestones

### ✅ Weeks 1-2: Foundation
- [ ] Set up development environment
- [ ] Create FastAPI hello world
- [ ] Learn Pydantic models
- [ ] Connect to OpenAI API
- [ ] Test embedding generation

### ✅ Weeks 3-4: PDF Processing
- [ ] Implement PDF upload endpoint
- [ ] Extract text from PDFs
- [ ] Implement text chunking
- [ ] Store documents in database
- [ ] Handle processing errors

### ✅ Weeks 5-6: Vector Search
- [ ] Set up Qdrant/ChromaDB
- [ ] Generate and store embeddings
- [ ] Implement similarity search
- [ ] Add filtering by document
- [ ] Test search quality

### ✅ Weeks 7-8: RAG Pipeline
- [ ] Build query endpoint
- [ ] Retrieve relevant chunks
- [ ] Create prompt templates
- [ ] Generate responses with LLM
- [ ] Implement citation tracking
- [ ] Handle edge cases

### ✅ Weeks 9-10: Agent System (Optional)
- [ ] Define tool schemas
- [ ] Implement tool execution
- [ ] Build agent loop
- [ ] Add tool error handling
- [ ] Test agent behavior

### ✅ Weeks 11-12: Frontend
- [ ] Choose frontend approach
- [ ] Build file upload UI
- [ ] Create chat interface
- [ ] Display citations
- [ ] Add document management
- [ ] Polish UX

### ✅ Weeks 13-14: Deployment
- [ ] Write Dockerfile
- [ ] Create docker-compose setup
- [ ] Choose cloud platform
- [ ] Deploy application
- [ ] Set up monitoring
- [ ] Write documentation
- [ ] Performance testing

---

## 📚 Recommended Learning Resources

### FastAPI
- [Official Tutorial](https://fastapi.tiangolo.com/tutorial/) - Comprehensive guide
- [Real Python Guide](https://realpython.com/fastapi-python-web-apis/) - Practical examples
- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)

### RAG & Vector Search
- [Building RAG Applications](https://www.deeplearning.ai/short-courses/building-applications-vector-databases/) - DeepLearning.AI (Free)
- [Pinecone Learning Center](https://www.pinecone.io/learn/) - RAG tutorials
- [Qdrant Documentation](https://qdrant.tech/documentation/) - Vector database guide
- [Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)

### LLMs & Prompt Engineering
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook) - Code examples
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Function Calling Tutorial](https://platform.openai.com/docs/guides/function-calling)

### Python Async
- [Real Python - Async IO](https://realpython.com/async-io-python/)
- [FastAPI Async Docs](https://fastapi.tiangolo.com/async/)

### Docker & Deployment
- [Docker Tutorial](https://docs.docker.com/get-started/)
- [Docker Compose Guide](https://docs.docker.com/compose/)
- [Google Cloud Run Docs](https://cloud.google.com/run/docs)

---

## 💡 Key Concepts to Master

### 1. Semantic Search
Understanding how embeddings capture meaning beyond keywords:
- Vector representations of text
- Cosine similarity for relevance
- Embedding models and dimensions
- Trade-offs: quality vs speed vs cost

### 2. Context Window Management
Efficiently fitting information within LLM token limits:
- Token counting and budgeting
- Context prioritization
- Truncation strategies
- Balancing retrieved context vs conversation history

### 3. Prompt Engineering
Crafting effective prompts for accurate responses:
- System prompts vs user prompts
- Few-shot examples
- Instruction clarity
- Output formatting requirements

### 4. Citation Tracking
Linking responses back to source documents:
- Mapping answers to chunks
- Preserving metadata through pipeline
- Citation format standardization
- Validation of cited sources

### 5. Async Programming
Handling concurrent requests efficiently:
- `async`/`await` syntax
- Non-blocking I/O operations
- Concurrent API calls
- Background task processing

### 6. Error Handling
Graceful failures and recovery:
- API rate limits and retries
- PDF processing errors
- Empty/invalid results
- User-friendly error messages

### 7. Token Optimization
Managing API costs effectively:
- Caching embeddings
- Batch processing
- Choosing appropriate models
- Monitoring usage

---

## 📊 Estimated Timeline

### Part-Time (10 hours/week)
- **Total:** 12-14 weeks
- **Foundation:** 2-3 weeks
- **Core RAG:** 4-5 weeks
- **Building System:** 4-5 weeks
- **Deployment:** 1-2 weeks

### Full-Time (40 hours/week)
- **Total:** 6-8 weeks
- **Foundation:** 1 week
- **Core RAG:** 2-3 weeks
- **Building System:** 2-3 weeks
- **Deployment:** 1 week

### With Prior Experience
If you already know Python, FastAPI, and async programming:
- **Total:** 4-6 weeks
- Focus on RAG-specific concepts
- Skip foundation, dive into implementation

---

## 🎓 Bonus: Advanced Features

After your core system works, add these incrementally:

### Level 1: Enhancements
- [ ] **Conversation History** - Multi-turn chat with context
- [ ] **Streaming Responses** - Real-time token streaming
- [ ] **Query Expansion** - Improve retrieval with synonyms
- [ ] **Caching** - Redis for frequent queries

### Level 2: Production Features
- [ ] **User Authentication** - JWT tokens
- [ ] **Rate Limiting** - Protect endpoints
- [ ] **API Keys** - Multi-tenant support
- [ ] **Usage Tracking** - Monitor API calls

### Level 3: Advanced RAG
- [ ] **Hybrid Search** - Combine semantic + keyword
- [ ] **Reranking** - Improve retrieval quality
- [ ] **Query Routing** - Route to appropriate models
- [ ] **Document Comparison** - Multi-doc analysis

### Level 4: Scale & Monitor
- [ ] **Logging** - Structured logs (JSON)
- [ ] **Metrics** - Prometheus/Grafana
- [ ] **Tracing** - OpenTelemetry
- [ ] **Alerts** - Sentry for errors

### Level 5: Multi-modal
- [ ] **GPT-4 Vision** - Handle images in PDFs
- [ ] **Table Extraction** - Parse structured data
- [ ] **Chart Analysis** - Understand visualizations

---

## 🔑 Success Criteria

Your minified RAG system should be able to:

### Core Functionality
- ✅ Accept PDF document uploads
- ✅ Extract and process text automatically
- ✅ Generate embeddings and store in vector DB
- ✅ Answer questions about uploaded documents
- ✅ Cite specific sources for answers
- ✅ Handle multiple documents simultaneously
- ✅ Provide simple web interface
- ✅ Run locally via Docker
- ✅ Deploy to cloud platform

### Quality Metrics
- ✅ Response time < 5 seconds for queries
- ✅ Relevant context retrieved > 80% of time
- ✅ Accurate citations for all claims
- ✅ Handles errors gracefully
- ✅ Clear documentation

### Technical Requirements
- ✅ Clean, modular code structure
- ✅ Type hints throughout
- ✅ Basic tests for core functions
- ✅ Environment variable configuration
- ✅ Logging for debugging

---

## 🎯 Getting Started Checklist

Before you begin, make sure you have:

- [ ] Python 3.10+ installed
- [ ] OpenAI API key (for embeddings and chat)
- [ ] Basic understanding of Python and APIs
- [ ] Text editor / IDE (VS Code recommended)
- [ ] Docker installed (for Qdrant and deployment)
- [ ] Git for version control
- [ ] 10-15 hours per week to dedicate

### First Steps

1. **Set up environment:**
```bash
# Create project directory
mkdir mini-rag && cd mini-rag

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install initial dependencies
pip install fastapi uvicorn python-dotenv openai
```

2. **Create hello world:**
```python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Mini RAG System", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

3. **Run it:**
```bash
uvicorn main:app --reload
# Visit http://localhost:8000/docs
```

4. **Start learning!** Follow the roadmap phases above.

---

## 🤝 Next Steps

Choose your path:

### 🚀 **I want to start coding immediately**
→ Skip to [Phase 3: Building the Mini RAG System](#phase-3-building-the-mini-rag-system-4-5-weeks)

### 📚 **I need to learn the fundamentals first**
→ Start with [Phase 1: Fundamentals](#phase-1-fundamentals-2-3-weeks)

### 🎓 **I want structured lessons**
→ Take the [DeepLearning.AI RAG course](https://www.deeplearning.ai/short-courses/)

### 💻 **I want a starter template**
→ Request a project scaffold with basic structure

### 🧪 **I want to experiment first**
→ Build the practice projects in Phase 2

---

## 📞 Support & Resources

- **OpenAI Discord** - API help and discussions
- **FastAPI Discord** - Framework support
- **Stack Overflow** - Q&A for specific issues
- **GitHub Discussions** - Community projects

---

**Good luck with your RAG system! 🚀**

*Remember: Start small, iterate often, and focus on getting each component working before moving to the next. The journey from "Hello World" to a production RAG system is a marathon, not a sprint.*

