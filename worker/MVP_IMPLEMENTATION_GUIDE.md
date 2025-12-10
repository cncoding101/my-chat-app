# 🚀 MVP Implementation Guide - Step by Step

A practical, action-oriented guide to build your Mini RAG System from scratch.

---

## 📋 Table of Contents
- [Phase 1: Setup & Environment](#phase-1-setup--environment)
- [Phase 2: Core Backend](#phase-2-core-backend)
- [Phase 3: PDF Processing](#phase-3-pdf-processing)
- [Phase 4: Vector Database](#phase-4-vector-database)
- [Phase 5: RAG Implementation](#phase-5-rag-implementation)
- [Phase 6: Frontend](#phase-6-frontend)
- [Phase 7: Testing & Deployment](#phase-7-testing--deployment)

---

## Phase 1: Setup & Environment

### Step 1: Create Project Directory
```bash
# Create main project directory
mkdir mini-rag
cd mini-rag

# Create folder structure
mkdir -p app/{services,database,utils}
mkdir -p tests
mkdir -p uploads
mkdir -p data
```

### Step 2: Initialize Git Repository
```bash
git init
touch .gitignore
```

**Add to `.gitignore`:**
```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
.venv/
venv/
ENV/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Data
uploads/
data/
qdrant_storage/
chroma_storage/
*.db
*.sqlite

# Logs
*.log
```

### Step 3: Set Up Python Virtual Environment
```bash
# Create virtual environment
python -m venv .venv

# Activate it
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip
```

### Step 4: Create `requirements.txt`
```bash
touch requirements.txt
```

**Add to `requirements.txt`:**
```
# Web Framework
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6

# Data Validation
pydantic==2.5.3
pydantic-settings==2.1.0

# Environment
python-dotenv==1.0.0

# Logging
loguru==0.7.2

# OpenAI
openai==1.10.0
tiktoken==0.5.2

# Vector Database (choose one)
qdrant-client==1.7.0
# chromadb==0.4.22

# PDF Processing
pypdf==4.0.1
pdf2image==1.17.0
Pillow==10.2.0

# Database
# For SQLite (built-in, no need to install)
# For PostgreSQL:
# psycopg2-binary==2.9.9

# Utilities
httpx==0.26.0
tenacity==8.2.3

# Testing
pytest==7.4.4
pytest-asyncio==0.23.3
```

### Step 5: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 6: Install System Dependencies (PDF Tools)
```bash
# macOS
brew install poppler

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y poppler-utils

# Verify installation
which pdftotext
which pdfinfo
```

### Step 7: Create Environment File
```bash
touch .env
touch .env.example
```

**Add to `.env.example`:**
```
# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Qdrant
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION=documents

# Database
DATABASE_URL=sqlite:///./data/mini_rag.db

# Application
DEBUG=true
LOG_LEVEL=INFO
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=50  # MB
```

**Copy and fill in `.env`:**
```bash
cp .env.example .env
# Edit .env with your actual API keys
```

### Step 8: Start Qdrant with Docker
```bash
# Pull and run Qdrant
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage:z \
  qdrant/qdrant

# Verify it's running
curl http://localhost:6333
```

### Step 9: Create Project Structure Files
```bash
# Create __init__ files
touch app/__init__.py
touch app/services/__init__.py
touch app/database/__init__.py
touch app/utils/__init__.py
touch tests/__init__.py

# Create main files
touch app/main.py
touch app/models.py
touch app/config.py
```

---

## Phase 2: Core Backend

### Step 10: Create Configuration Module
**Create `app/config.py`:**
```python
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # OpenAI
    openai_api_key: str
    openai_model: str = "gpt-4"
    openai_embedding_model: str = "text-embedding-3-small"
    
    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_collection: str = "documents"
    
    # Database
    database_url: str = "sqlite:///./data/mini_rag.db"
    
    # Application
    debug: bool = True
    log_level: str = "INFO"
    upload_dir: str = "./uploads"
    max_upload_size: int = 50  # MB
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
```

### Step 11: Create Pydantic Models
**Create `app/models.py`:**
```python
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class DocumentStatus(str, Enum):
    """Document processing status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentCreate(BaseModel):
    """Document creation request."""
    filename: str


class Document(BaseModel):
    """Document database model."""
    id: str
    filename: str
    upload_date: datetime
    page_count: Optional[int] = None
    chunk_count: Optional[int] = None
    status: DocumentStatus
    error_message: Optional[str] = None


class Chunk(BaseModel):
    """Text chunk model."""
    id: int
    document_id: str
    chunk_index: int
    content: str
    token_count: int
    page_number: Optional[int] = None
    vector_id: Optional[str] = None


class SearchRequest(BaseModel):
    """Search request model."""
    query: str
    document_ids: Optional[List[str]] = None
    top_k: int = Field(default=5, ge=1, le=20)
    score_threshold: float = Field(default=0.7, ge=0.0, le=1.0)


class SearchResult(BaseModel):
    """Search result model."""
    chunk_id: int
    document_id: str
    document_name: str
    content: str
    score: float
    page_number: Optional[int] = None
    chunk_index: int


class SearchResponse(BaseModel):
    """Search response model."""
    query: str
    results: List[SearchResult]
    total_found: int


class ChatRequest(BaseModel):
    """Chat request model."""
    question: str
    document_ids: Optional[List[str]] = None
    max_tokens: int = Field(default=500, ge=100, le=2000)
    temperature: float = Field(default=0.1, ge=0.0, le=2.0)


class Citation(BaseModel):
    """Citation model."""
    document_id: str
    document_name: str
    chunk_index: int
    page_number: Optional[int] = None
    content: str
    score: float


class ChatResponse(BaseModel):
    """Chat response model."""
    answer: str
    citations: List[Citation]
    sources_used: int
    total_tokens: int
```

### Step 12: Create FastAPI Application
**Create `app/main.py`:**
```python
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys

from app.config import get_settings
from app.models import (
    Document, SearchRequest, SearchResponse, 
    ChatRequest, ChatResponse, DocumentStatus
)

# Configure logging
logger.remove()
logger.add(sys.stderr, level=get_settings().log_level)

# Create FastAPI app
app = FastAPI(
    title="Mini RAG System",
    description="A simplified RAG system for document Q&A",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Root endpoint."""
    return {
        "message": "Mini RAG System",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """Upload and process a PDF document."""
    # TODO: Implement in next steps
    return {"message": "Upload endpoint - to be implemented"}


@app.get("/documents")
async def list_documents():
    """List all documents."""
    # TODO: Implement in next steps
    return {"documents": []}


@app.get("/documents/{document_id}")
async def get_document(document_id: str):
    """Get document details."""
    # TODO: Implement in next steps
    return {"document": None}


@app.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document."""
    # TODO: Implement in next steps
    return {"message": "Document deleted"}


@app.post("/search", response_model=SearchResponse)
async def search_documents(request: SearchRequest):
    """Search for relevant document chunks."""
    # TODO: Implement in next steps
    return SearchResponse(query=request.query, results=[], total_found=0)


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Answer questions using RAG."""
    # TODO: Implement in next steps
    return ChatResponse(
        answer="Chat endpoint - to be implemented",
        citations=[],
        sources_used=0,
        total_tokens=0
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Step 13: Test Basic Server
```bash
# Run the server
uvicorn app.main:app --reload --port 8000

# In another terminal, test it
curl http://localhost:8000/
curl http://localhost:8000/health

# Or visit in browser:
# http://localhost:8000/docs
```

---

## Phase 3: PDF Processing

### Step 14: Create Text Chunking Utility
**Create `app/utils/chunking.py`:**
```python
import tiktoken
from typing import List
from loguru import logger


def count_tokens(text: str, model: str = "gpt-4") -> int:
    """Count tokens in text."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    
    return len(encoding.encode(text))


def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
    model: str = "gpt-4"
) -> List[str]:
    """
    Split text into chunks with overlap.
    
    Args:
        text: Text to chunk
        chunk_size: Target size of each chunk in tokens
        overlap: Number of tokens to overlap between chunks
        model: Model name for tokenization
    
    Returns:
        List of text chunks
    """
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    
    tokens = encoding.encode(text)
    chunks = []
    
    start = 0
    while start < len(tokens):
        end = start + chunk_size
        chunk_tokens = tokens[start:end]
        chunk_text = encoding.decode(chunk_tokens)
        chunks.append(chunk_text)
        
        # Move start forward, accounting for overlap
        start += chunk_size - overlap
    
    logger.info(f"Created {len(chunks)} chunks from {len(tokens)} tokens")
    return chunks


def chunk_text_with_metadata(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
    model: str = "gpt-4"
) -> List[dict]:
    """
    Split text into chunks with metadata.
    
    Returns:
        List of dicts with 'text' and 'token_count' keys
    """
    chunks = chunk_text(text, chunk_size, overlap, model)
    
    return [
        {
            "text": chunk,
            "token_count": count_tokens(chunk, model),
            "chunk_index": idx
        }
        for idx, chunk in enumerate(chunks)
    ]
```

### Step 15: Create PDF Processor
**Create `app/services/pdf_processor.py`:**
```python
from pypdf import PdfReader
from typing import Dict, List
from loguru import logger
import os


def extract_text_from_pdf(pdf_path: str) -> Dict:
    """
    Extract text from PDF file.
    
    Args:
        pdf_path: Path to PDF file
    
    Returns:
        Dict with text, page_count, and pages list
    """
    logger.info(f"Extracting text from: {pdf_path}")
    
    try:
        reader = PdfReader(pdf_path)
        page_count = len(reader.pages)
        
        pages = []
        full_text = []
        
        for page_num, page in enumerate(reader.pages, 1):
            text = page.extract_text()
            pages.append({
                "page_number": page_num,
                "text": text,
                "char_count": len(text)
            })
            full_text.append(text)
        
        result = {
            "text": "\n\n".join(full_text),
            "page_count": page_count,
            "pages": pages,
            "metadata": {
                "author": reader.metadata.get("/Author", ""),
                "title": reader.metadata.get("/Title", ""),
                "subject": reader.metadata.get("/Subject", "")
            } if reader.metadata else {}
        }
        
        logger.info(f"Extracted {page_count} pages, {len(result['text'])} characters")
        return result
        
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        raise


def is_text_based_pdf(pdf_path: str, min_pages: int = 3) -> bool:
    """
    Check if PDF contains extractable text.
    
    Args:
        pdf_path: Path to PDF file
        min_pages: Number of pages to check
    
    Returns:
        True if PDF has extractable text
    """
    try:
        reader = PdfReader(pdf_path)
        pages_to_check = min(min_pages, len(reader.pages))
        
        for page in reader.pages[:pages_to_check]:
            text = page.extract_text()
            if len(text.strip()) < 50:  # Threshold for text content
                return False
        
        return True
    except Exception as e:
        logger.error(f"Error checking PDF type: {e}")
        return False


def validate_pdf(pdf_path: str, max_size_mb: int = 50) -> bool:
    """
    Validate PDF file.
    
    Args:
        pdf_path: Path to PDF file
        max_size_mb: Maximum allowed file size in MB
    
    Returns:
        True if PDF is valid
    """
    # Check file exists
    if not os.path.exists(pdf_path):
        raise ValueError(f"File not found: {pdf_path}")
    
    # Check file size
    file_size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
    if file_size_mb > max_size_mb:
        raise ValueError(f"File too large: {file_size_mb:.2f}MB (max: {max_size_mb}MB)")
    
    # Check if it's a valid PDF
    try:
        PdfReader(pdf_path)
        return True
    except Exception as e:
        raise ValueError(f"Invalid PDF file: {e}")
```

### Step 16: Test PDF Processing
**Create `tests/test_pdf_processor.py`:**
```python
import pytest
from app.services.pdf_processor import extract_text_from_pdf, validate_pdf


def test_pdf_extraction():
    """Test PDF text extraction."""
    # You'll need a sample PDF file for this test
    # For now, this is a placeholder
    pass


def test_pdf_validation():
    """Test PDF validation."""
    # Add test cases
    pass
```

---

## Phase 4: Vector Database

### Step 17: Create Embeddings Service
**Create `app/services/embeddings.py`:**
```python
from openai import OpenAI
from typing import List
from loguru import logger
from app.config import get_settings

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)


def generate_embedding(text: str, model: str = None) -> List[float]:
    """
    Generate embedding for a single text.
    
    Args:
        text: Text to embed
        model: Embedding model name
    
    Returns:
        List of floats representing the embedding
    """
    if model is None:
        model = settings.openai_embedding_model
    
    try:
        response = client.embeddings.create(
            input=text,
            model=model
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Failed to generate embedding: {e}")
        raise


def generate_embeddings_batch(
    texts: List[str],
    model: str = None,
    batch_size: int = 100
) -> List[List[float]]:
    """
    Generate embeddings for multiple texts in batches.
    
    Args:
        texts: List of texts to embed
        model: Embedding model name
        batch_size: Number of texts to process at once
    
    Returns:
        List of embeddings
    """
    if model is None:
        model = settings.openai_embedding_model
    
    all_embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        logger.info(f"Processing batch {i//batch_size + 1} ({len(batch)} texts)")
        
        try:
            response = client.embeddings.create(
                input=batch,
                model=model
            )
            embeddings = [item.embedding for item in response.data]
            all_embeddings.extend(embeddings)
        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            raise
    
    logger.info(f"Generated {len(all_embeddings)} embeddings")
    return all_embeddings
```

### Step 18: Create Vector Store Interface
**Create `app/services/vector_store.py`:**
```python
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct, Filter, 
    FieldCondition, MatchAny, SearchRequest
)
from typing import List, Dict, Optional
from loguru import logger
from app.config import get_settings

settings = get_settings()


class VectorStore:
    """Vector database interface."""
    
    def __init__(self):
        """Initialize Qdrant client."""
        self.client = QdrantClient(
            host=settings.qdrant_host,
            port=settings.qdrant_port
        )
        self.collection_name = settings.qdrant_collection
        self._ensure_collection()
    
    def _ensure_collection(self):
        """Create collection if it doesn't exist."""
        collections = self.client.get_collections().collections
        collection_names = [c.name for c in collections]
        
        if self.collection_name not in collection_names:
            logger.info(f"Creating collection: {self.collection_name}")
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=1536,  # OpenAI text-embedding-3-small dimension
                    distance=Distance.COSINE
                )
            )
        else:
            logger.info(f"Collection exists: {self.collection_name}")
    
    def add_chunks(
        self,
        document_id: str,
        document_name: str,
        chunks: List[Dict]
    ):
        """
        Add document chunks to vector store.
        
        Args:
            document_id: Unique document identifier
            document_name: Document filename
            chunks: List of chunk dicts with 'text', 'embedding', 'chunk_index', etc.
        """
        points = []
        
        for chunk in chunks:
            point = PointStruct(
                id=chunk["vector_id"],
                vector=chunk["embedding"],
                payload={
                    "document_id": document_id,
                    "document_name": document_name,
                    "chunk_index": chunk["chunk_index"],
                    "text": chunk["text"],
                    "page_number": chunk.get("page_number"),
                    "chunk_id": chunk.get("chunk_id"),
                    "token_count": chunk.get("token_count", 0)
                }
            )
            points.append(point)
        
        self.client.upsert(
            collection_name=self.collection_name,
            points=points,
            wait=True
        )
        
        logger.info(f"Added {len(points)} chunks for document {document_id}")
    
    def search(
        self,
        query_vector: List[float],
        top_k: int = 5,
        score_threshold: float = 0.7,
        document_ids: Optional[List[str]] = None
    ) -> List[Dict]:
        """
        Search for similar chunks.
        
        Args:
            query_vector: Query embedding
            top_k: Number of results to return
            score_threshold: Minimum similarity score
            document_ids: Optional list of document IDs to filter
        
        Returns:
            List of search results
        """
        # Build filter if document_ids provided
        query_filter = None
        if document_ids:
            query_filter = Filter(
                must=[
                    FieldCondition(
                        key="document_id",
                        match=MatchAny(any=document_ids)
                    )
                ]
            )
        
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=top_k,
            score_threshold=score_threshold,
            query_filter=query_filter
        )
        
        formatted_results = []
        for result in results:
            formatted_results.append({
                "chunk_id": result.payload.get("chunk_id"),
                "document_id": result.payload["document_id"],
                "document_name": result.payload["document_name"],
                "content": result.payload["text"],
                "score": result.score,
                "page_number": result.payload.get("page_number"),
                "chunk_index": result.payload["chunk_index"]
            })
        
        logger.info(f"Found {len(formatted_results)} results")
        return formatted_results
    
    def delete_document(self, document_id: str):
        """Delete all chunks for a document."""
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="document_id",
                        match={"value": document_id}
                    )
                ]
            )
        )
        logger.info(f"Deleted chunks for document {document_id}")
```

### Step 19: Test Vector Store
```bash
# Run Python shell
python

# Test connection
>>> from app.services.vector_store import VectorStore
>>> vs = VectorStore()
>>> # Should see "Collection exists" or "Creating collection"
```

---

## Phase 5: RAG Implementation

### Step 20: Create Database Module
**Create `app/database/db.py`:**
```python
import sqlite3
from contextlib import contextmanager
from typing import List, Optional, Dict
from datetime import datetime
import uuid
from loguru import logger
from app.config import get_settings
from app.models import Document, DocumentStatus, Chunk

settings = get_settings()


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
                status TEXT NOT NULL,
                error_message TEXT
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
    logger.info("Database initialized")


@contextmanager
def get_db_connection():
    """Get database connection with context manager."""
    # Extract database path from URL
    db_path = settings.database_url.replace("sqlite:///", "")
    
    # Create parent directory if needed
    import os
    os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


class DocumentDB:
    """Database operations for documents."""
    
    @staticmethod
    def create_document(filename: str) -> str:
        """Create a new document record."""
        doc_id = str(uuid.uuid4())
        
        with get_db_connection() as conn:
            conn.execute(
                """
                INSERT INTO documents (id, filename, status)
                VALUES (?, ?, ?)
                """,
                (doc_id, filename, DocumentStatus.PENDING.value)
            )
        
        logger.info(f"Created document {doc_id}")
        return doc_id
    
    @staticmethod
    def get_document(doc_id: str) -> Optional[Document]:
        """Get document by ID."""
        with get_db_connection() as conn:
            row = conn.execute(
                "SELECT * FROM documents WHERE id = ?",
                (doc_id,)
            ).fetchone()
            
            if row:
                return Document(
                    id=row["id"],
                    filename=row["filename"],
                    upload_date=datetime.fromisoformat(row["upload_date"]),
                    page_count=row["page_count"],
                    chunk_count=row["chunk_count"],
                    status=DocumentStatus(row["status"]),
                    error_message=row["error_message"]
                )
        return None
    
    @staticmethod
    def list_documents() -> List[Document]:
        """List all documents."""
        with get_db_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM documents ORDER BY upload_date DESC"
            ).fetchall()
            
            return [
                Document(
                    id=row["id"],
                    filename=row["filename"],
                    upload_date=datetime.fromisoformat(row["upload_date"]),
                    page_count=row["page_count"],
                    chunk_count=row["chunk_count"],
                    status=DocumentStatus(row["status"]),
                    error_message=row["error_message"]
                )
                for row in rows
            ]
    
    @staticmethod
    def update_status(
        doc_id: str,
        status: DocumentStatus,
        page_count: Optional[int] = None,
        chunk_count: Optional[int] = None,
        error_message: Optional[str] = None
    ):
        """Update document status."""
        with get_db_connection() as conn:
            conn.execute(
                """
                UPDATE documents
                SET status = ?, page_count = ?, chunk_count = ?, error_message = ?
                WHERE id = ?
                """,
                (status.value, page_count, chunk_count, error_message, doc_id)
            )
        logger.info(f"Updated document {doc_id} status to {status}")
    
    @staticmethod
    def delete_document(doc_id: str):
        """Delete document and its chunks."""
        with get_db_connection() as conn:
            conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        logger.info(f"Deleted document {doc_id}")
    
    @staticmethod
    def add_chunks(doc_id: str, chunks: List[Dict]):
        """Add chunks for a document."""
        with get_db_connection() as conn:
            conn.executemany(
                """
                INSERT INTO chunks 
                (document_id, chunk_index, content, token_count, page_number, vector_id)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        doc_id,
                        chunk["chunk_index"],
                        chunk["text"],
                        chunk.get("token_count", 0),
                        chunk.get("page_number"),
                        chunk["vector_id"]
                    )
                    for chunk in chunks
                ]
            )
        logger.info(f"Added {len(chunks)} chunks for document {doc_id}")


# Initialize database on import
init_database()
```

### Step 21: Create Document Processing Pipeline
**Create `app/services/document_processor.py`:**
```python
import os
import uuid
from typing import Dict
from loguru import logger

from app.services.pdf_processor import extract_text_from_pdf, validate_pdf
from app.utils.chunking import chunk_text_with_metadata
from app.services.embeddings import generate_embeddings_batch
from app.services.vector_store import VectorStore
from app.database.db import DocumentDB
from app.models import DocumentStatus
from app.config import get_settings

settings = get_settings()


async def process_document(doc_id: str, file_path: str, filename: str):
    """
    Process a document: extract text, chunk, embed, and store.
    
    Args:
        doc_id: Document ID
        file_path: Path to PDF file
        filename: Original filename
    """
    try:
        logger.info(f"Processing document {doc_id}: {filename}")
        
        # Update status to processing
        DocumentDB.update_status(doc_id, DocumentStatus.PROCESSING)
        
        # Step 1: Validate PDF
        validate_pdf(file_path, settings.max_upload_size)
        
        # Step 2: Extract text
        pdf_data = extract_text_from_pdf(file_path)
        page_count = pdf_data["page_count"]
        text = pdf_data["text"]
        
        if not text.strip():
            raise ValueError("No text could be extracted from PDF")
        
        # Step 3: Chunk text
        chunks = chunk_text_with_metadata(
            text=text,
            chunk_size=500,
            overlap=50
        )
        
        # Step 4: Generate embeddings
        chunk_texts = [chunk["text"] for chunk in chunks]
        embeddings = generate_embeddings_batch(chunk_texts)
        
        # Step 5: Prepare chunks with embeddings and IDs
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            chunk["embedding"] = embedding
            chunk["vector_id"] = f"{doc_id}_{idx}"
            chunk["document_id"] = doc_id
            chunk["chunk_id"] = idx
        
        # Step 6: Store in vector database
        vector_store = VectorStore()
        vector_store.add_chunks(
            document_id=doc_id,
            document_name=filename,
            chunks=chunks
        )
        
        # Step 7: Store chunks in SQL database
        DocumentDB.add_chunks(doc_id, chunks)
        
        # Step 8: Update document status
        DocumentDB.update_status(
            doc_id,
            DocumentStatus.COMPLETED,
            page_count=page_count,
            chunk_count=len(chunks)
        )
        
        logger.info(f"Successfully processed document {doc_id}")
        
        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)
        
    except Exception as e:
        logger.error(f"Failed to process document {doc_id}: {e}")
        DocumentDB.update_status(
            doc_id,
            DocumentStatus.FAILED,
            error_message=str(e)
        )
        
        # Clean up on failure
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise
```

### Step 22: Create RAG Service
**Create `app/services/rag.py`:**
```python
from openai import OpenAI
from typing import List, Dict
from loguru import logger

from app.services.embeddings import generate_embedding
from app.services.vector_store import VectorStore
from app.models import SearchRequest, SearchResponse, SearchResult
from app.models import ChatRequest, ChatResponse, Citation
from app.config import get_settings

settings = get_settings()
openai_client = OpenAI(api_key=settings.openai_api_key)
vector_store = VectorStore()


def search_documents(request: SearchRequest) -> SearchResponse:
    """
    Search for relevant document chunks.
    
    Args:
        request: Search request
    
    Returns:
        Search response with results
    """
    logger.info(f"Searching for: {request.query}")
    
    # Generate query embedding
    query_embedding = generate_embedding(request.query)
    
    # Search vector database
    results = vector_store.search(
        query_vector=query_embedding,
        top_k=request.top_k,
        score_threshold=request.score_threshold,
        document_ids=request.document_ids
    )
    
    # Convert to SearchResult models
    search_results = [SearchResult(**result) for result in results]
    
    return SearchResponse(
        query=request.query,
        results=search_results,
        total_found=len(search_results)
    )


def generate_rag_response(request: ChatRequest) -> ChatResponse:
    """
    Generate response using RAG.
    
    Args:
        request: Chat request
    
    Returns:
        Chat response with answer and citations
    """
    logger.info(f"Generating RAG response for: {request.question}")
    
    # Step 1: Search for relevant context
    search_request = SearchRequest(
        query=request.question,
        document_ids=request.document_ids,
        top_k=5,
        score_threshold=0.7
    )
    search_response = search_documents(search_request)
    
    if not search_response.results:
        return ChatResponse(
            answer="I couldn't find any relevant information to answer your question. Please try rephrasing or ensure you have uploaded relevant documents.",
            citations=[],
            sources_used=0,
            total_tokens=0
        )
    
    # Step 2: Build prompt with context
    context = build_context(search_response.results)
    system_prompt = build_system_prompt(context, request.question)
    
    # Step 3: Generate response with OpenAI
    try:
        completion = openai_client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.question}
            ],
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        answer = completion.choices[0].message.content
        total_tokens = completion.usage.total_tokens
        
    except Exception as e:
        logger.error(f"Failed to generate response: {e}")
        raise
    
    # Step 4: Format citations
    citations = [
        Citation(
            document_id=result.document_id,
            document_name=result.document_name,
            chunk_index=result.chunk_index,
            page_number=result.page_number,
            content=result.content,
            score=result.score
        )
        for result in search_response.results
    ]
    
    return ChatResponse(
        answer=answer,
        citations=citations,
        sources_used=len(citations),
        total_tokens=total_tokens
    )


def build_context(results: List[SearchResult]) -> str:
    """Build context string from search results."""
    context_parts = []
    
    for idx, result in enumerate(results, 1):
        context_parts.append(
            f"[Source {idx}: {result.document_name}, "
            f"Page {result.page_number or 'N/A'}]\n{result.content}\n"
        )
    
    return "\n---\n".join(context_parts)


def build_system_prompt(context: str, question: str) -> str:
    """Build system prompt with context."""
    return f"""You are a helpful AI assistant that answers questions based on provided context.

INSTRUCTIONS:
1. Answer the question using ONLY information from the provided context
2. If the context doesn't contain enough information, say so clearly
3. Be concise and accurate
4. Reference sources when making claims (e.g., "According to Source 1...")
5. If multiple sources support a claim, mention them all

CONTEXT:
{context}

USER QUESTION:
{question}

Provide a well-structured answer based on the context above."""
```

### Step 23: Update Main App with Endpoints
**Update `app/main.py`:**
```python
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys
import os
import uuid

from app.config import get_settings
from app.models import (
    Document, SearchRequest, SearchResponse, 
    ChatRequest, ChatResponse, DocumentStatus
)
from app.database.db import DocumentDB
from app.services.document_processor import process_document
from app.services.rag import search_documents, generate_rag_response
from app.services.vector_store import VectorStore

settings = get_settings()

# Configure logging
logger.remove()
logger.add(sys.stderr, level=settings.log_level)

# Create FastAPI app
app = FastAPI(
    title="Mini RAG System",
    description="A simplified RAG system for document Q&A",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
os.makedirs(settings.upload_dir, exist_ok=True)


@app.get("/")
def read_root():
    """Root endpoint."""
    return {
        "message": "Mini RAG System",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """Upload and process a PDF document."""
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Create document record
    doc_id = DocumentDB.create_document(file.filename)
    
    # Save uploaded file
    file_path = os.path.join(settings.upload_dir, f"{doc_id}.pdf")
    
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Process in background
        background_tasks.add_task(
            process_document,
            doc_id=doc_id,
            file_path=file_path,
            filename=file.filename
        )
        
        return {
            "document_id": doc_id,
            "filename": file.filename,
            "status": "processing",
            "message": "Document uploaded successfully and processing started"
        }
        
    except Exception as e:
        logger.error(f"Failed to upload document: {e}")
        # Clean up
        if os.path.exists(file_path):
            os.remove(file_path)
        DocumentDB.delete_document(doc_id)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/documents")
async def list_documents():
    """List all documents."""
    documents = DocumentDB.list_documents()
    return {"documents": [doc.dict() for doc in documents]}


@app.get("/documents/{document_id}")
async def get_document(document_id: str):
    """Get document details."""
    document = DocumentDB.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document.dict()


@app.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document."""
    document = DocumentDB.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete from vector store
    vector_store = VectorStore()
    vector_store.delete_document(document_id)
    
    # Delete from database
    DocumentDB.delete_document(document_id)
    
    return {"message": "Document deleted successfully"}


@app.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """Search for relevant document chunks."""
    try:
        return search_documents(request)
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Answer questions using RAG."""
    try:
        return generate_rag_response(request)
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Step 24: Test the Complete Backend
```bash
# Start the server
uvicorn app.main:app --reload --port 8000

# In another terminal, test endpoints:

# 1. Check health
curl http://localhost:8000/health

# 2. Upload a PDF (replace with your PDF file)
curl -X POST -F "file=@test.pdf" http://localhost:8000/upload

# 3. List documents
curl http://localhost:8000/documents

# 4. Search (after document is processed)
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What is this document about?", "top_k": 3}'

# 5. Chat (ask a question)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the main points in the document?"}'
```

---

## Phase 6: Frontend

### Step 25: Create Streamlit Frontend
**Create `frontend.py` in project root:**
```python
import streamlit as st
import requests
import time
from typing import List, Dict

API_URL = "http://localhost:8000"

st.set_page_config(
    page_title="Mini RAG System",
    page_icon="📚",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .citation {
        background-color: #f0f2f6;
        padding: 10px;
        border-radius: 5px;
        margin: 5px 0;
        font-size: 0.9em;
    }
    .document-item {
        padding: 10px;
        border-left: 3px solid #4CAF50;
        margin: 5px 0;
    }
</style>
""", unsafe_allow_html=True)


def upload_document(file):
    """Upload document to API."""
    files = {"file": file}
    response = requests.post(f"{API_URL}/upload", files=files)
    return response.json() if response.ok else None


def get_documents() -> List[Dict]:
    """Get list of documents."""
    response = requests.get(f"{API_URL}/documents")
    if response.ok:
        return response.json().get("documents", [])
    return []


def delete_document(doc_id: str):
    """Delete a document."""
    response = requests.delete(f"{API_URL}/documents/{doc_id}")
    return response.ok


def search_documents(query: str, doc_ids: List[str] = None) -> Dict:
    """Search documents."""
    payload = {"query": query}
    if doc_ids:
        payload["document_ids"] = doc_ids
    
    response = requests.post(f"{API_URL}/search", json=payload)
    return response.json() if response.ok else None


def chat(question: str, doc_ids: List[str] = None) -> Dict:
    """Get answer from RAG system."""
    payload = {"question": question}
    if doc_ids:
        payload["document_ids"] = doc_ids
    
    response = requests.post(f"{API_URL}/chat", json=payload)
    return response.json() if response.ok else None


# Main app
st.title("📚 Mini RAG System")
st.markdown("Upload documents and ask questions about them!")

# Sidebar for document management
with st.sidebar:
    st.header("📁 Document Management")
    
    # Upload section
    st.subheader("Upload New Document")
    uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")
    
    if uploaded_file:
        if st.button("📤 Upload", key="upload_btn"):
            with st.spinner("Uploading..."):
                result = upload_document(uploaded_file)
                if result:
                    st.success(f"✅ {result.get('message', 'Uploaded!')}")
                    st.info(f"Document ID: {result.get('document_id')}")
                    time.sleep(1)
                    st.rerun()
                else:
                    st.error("❌ Upload failed")
    
    st.divider()
    
    # Documents list
    st.subheader("📚 Your Documents")
    documents = get_documents()
    
    if not documents:
        st.info("No documents yet. Upload one to get started!")
    else:
        for doc in documents:
            status_emoji = {
                "completed": "✅",
                "processing": "⏳",
                "pending": "⏸️",
                "failed": "❌"
            }.get(doc["status"], "❓")
            
            with st.container():
                col1, col2 = st.columns([4, 1])
                
                with col1:
                    st.markdown(f"**{status_emoji} {doc['filename']}**")
                    st.caption(f"Status: {doc['status']}")
                    if doc.get("page_count"):
                        st.caption(f"Pages: {doc['page_count']} | Chunks: {doc.get('chunk_count', 0)}")
                
                with col2:
                    if st.button("🗑️", key=f"del_{doc['id']}", help="Delete"):
                        if delete_document(doc['id']):
                            st.success("Deleted!")
                            time.sleep(0.5)
                            st.rerun()
                
                st.divider()

# Main content area - Chat interface
st.header("💬 Ask Questions")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        
        # Show citations if present
        if message.get("citations"):
            with st.expander("📚 Sources"):
                for citation in message["citations"]:
                    st.markdown(f"""
                    <div class="citation">
                        <strong>{citation['document_name']}</strong> 
                        (Page {citation.get('page_number', 'N/A')}, Score: {citation['score']:.2f})
                        <br><em>{citation['content'][:200]}...</em>
                    </div>
                    """, unsafe_allow_html=True)

# Chat input
if prompt := st.chat_input("What would you like to know about your documents?"):
    # Check if we have documents
    docs = get_documents()
    completed_docs = [d for d in docs if d["status"] == "completed"]
    
    if not completed_docs:
        st.warning("⚠️ Please upload and wait for documents to be processed before asking questions.")
    else:
        # Add user message
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
        
        # Get AI response
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                response = chat(prompt)
                
                if response:
                    answer = response["answer"]
                    citations = response.get("citations", [])
                    
                    st.markdown(answer)
                    
                    if citations:
                        with st.expander(f"📚 {len(citations)} Sources"):
                            for citation in citations:
                                st.markdown(f"""
                                <div class="citation">
                                    <strong>{citation['document_name']}</strong> 
                                    (Page {citation.get('page_number', 'N/A')}, Score: {citation['score']:.2f})
                                    <br><em>{citation['content'][:200]}...</em>
                                </div>
                                """, unsafe_allow_html=True)
                    
                    # Save to history
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": answer,
                        "citations": citations
                    })
                else:
                    st.error("Failed to get response from API")

# Footer
st.divider()
st.caption("Mini RAG System v1.0 | Built with FastAPI & Streamlit")
```

### Step 26: Test Frontend
```bash
# Make sure backend is running
# In terminal 1:
uvicorn app.main:app --reload --port 8000

# In terminal 2:
streamlit run frontend.py

# Browser should open automatically to http://localhost:8501
```

---

## Phase 7: Testing & Deployment

### Step 27: Create Tests
**Create `tests/test_api.py`:**
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "running"


def test_health():
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_list_documents():
    """Test list documents endpoint."""
    response = client.get("/documents")
    assert response.status_code == 200
    assert "documents" in response.json()


# Add more tests as needed
```

**Run tests:**
```bash
pytest tests/ -v
```

### Step 28: Create Docker Setup
**Create `Dockerfile`:**
```dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    poppler-utils \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads data

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Create `docker-compose.yml`:**
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
    depends_on:
      - qdrant
    volumes:
      - ./uploads:/app/uploads
      - ./data:/app/data
    restart: unless-stopped

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_storage:/qdrant/storage
    restart: unless-stopped

volumes:
  qdrant_storage:
```

### Step 29: Test Docker Setup
```bash
# Create .env file with your OpenAI key
echo "OPENAI_API_KEY=your_key_here" > .env

# Build and run
docker-compose up --build

# Test in another terminal
curl http://localhost:8000/health

# Stop
docker-compose down
```

### Step 30: Create Documentation
**Create `README.md`:**
```markdown
# Mini RAG System

A simplified Retrieval Augmented Generation (RAG) system for document Q&A.

## Features

- PDF document upload and processing
- Semantic search using embeddings
- Question answering with source citations
- Simple web interface

## Quick Start

### Prerequisites

- Python 3.10+
- Docker (for Qdrant)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo>
cd mini-rag
```

2. Create virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Install system dependencies:
```bash
# macOS
brew install poppler

# Ubuntu/Debian
sudo apt-get install poppler-utils
```

5. Set up environment:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

6. Start Qdrant:
```bash
docker run -d -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
```

### Running

1. Start the API:
```bash
uvicorn app.main:app --reload --port 8000
```

2. Start the frontend (in another terminal):
```bash
streamlit run frontend.py
```

3. Open browser to http://localhost:8501

## Docker Deployment

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## API Documentation

Once running, visit http://localhost:8000/docs for interactive API documentation.

## Project Structure

```
mini-rag/
├── app/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── config.py            # Configuration
│   ├── services/            # Business logic
│   ├── database/            # Database operations
│   └── utils/               # Utilities
├── tests/                   # Tests
├── frontend.py              # Streamlit UI
├── requirements.txt         # Dependencies
├── Dockerfile              # Docker configuration
└── docker-compose.yml      # Docker Compose setup
```

## License

MIT
```

### Step 31: Create `.dockerignore`
```
**/__pycache__
**/*.pyc
**/*.pyo
**/*.pyd
.Python
.venv/
venv/
ENV/
.env
.env.local
.git/
.gitignore
*.md
uploads/
data/
qdrant_storage/
*.db
*.sqlite
.pytest_cache/
.vscode/
.idea/
```

---

## ✅ Final Checklist

Before you're done, verify:

- [ ] **Backend runs** - `uvicorn app.main:app --reload`
- [ ] **Frontend runs** - `streamlit run frontend.py`
- [ ] **Qdrant is running** - `curl http://localhost:6333`
- [ ] **Can upload PDFs** - Test through UI or API
- [ ] **Documents process** - Check status becomes "completed"
- [ ] **Can ask questions** - Get answers with citations
- [ ] **Docker works** - `docker-compose up` runs everything
- [ ] **Tests pass** - `pytest tests/ -v`
- [ ] **Documentation complete** - README.md is clear

---

## 🎉 Congratulations!

You've built a complete Mini RAG System! 

### Next Steps:

1. **Test with real PDFs** - Upload various documents
2. **Experiment with parameters** - Adjust chunk size, top_k, temperature
3. **Monitor performance** - Check response times and quality
4. **Add features** - Conversation history, user auth, etc.
5. **Deploy to cloud** - Use Render, Railway, or GCP

### Common Issues & Solutions:

**Problem**: PDF extraction fails
- **Solution**: Ensure poppler is installed: `which pdftotext`

**Problem**: Embedding generation slow
- **Solution**: Use batch processing (already implemented)

**Problem**: No results from search
- **Solution**: Check score_threshold (try lowering it)

**Problem**: Docker containers won't start
- **Solution**: Check if ports 6333 and 8000 are available

---

## 📞 Support

- Check logs: `tail -f app.log` or `docker-compose logs -f`
- Test endpoints: Visit `http://localhost:8000/docs`
- Verify Qdrant: `curl http://localhost:6333`

Happy building! 🚀

