# 🎯 MVP Build Checklist: RAG Document Chat Application

A detailed, step-by-step guide to build your MVP from scratch.

---

## 🏗️ Architecture Decision

**Option A: SvelteKit Full-Stack** (Recommended - matches original app)

- Frontend: SvelteKit + Svelte 5
- Backend: SvelteKit API routes
- Language: TypeScript
- Pros: Single codebase, type-safe end-to-end, faster development

**Option B: Separate Frontend/Backend**

- Frontend: SvelteKit
- Backend: FastAPI (Python)
- Pros: Better for Python ML/AI workflows, separate scaling

**This guide follows Option A (SvelteKit Full-Stack)**

---

## 📋 Pre-Setup Requirements

- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed (or use Docker)
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] OpenAI API key ([get one here](https://platform.openai.com/api-keys))
- [ ] Pinecone account ([free tier](https://www.pinecone.io/))

---

## Phase 1: Project Initialization

### Step 1: Create SvelteKit Project

```bash
# Create new SvelteKit project
npm create svelte@latest rag-document-chat

# When prompted, select:
# - Skeleton project
# - Yes, using TypeScript syntax
# - Add ESLint
# - Add Prettier
# - Add Playwright (optional)
# - Add Vitest (optional)

cd rag-document-chat
npm install
```

**Verify:** Run `npm run dev` and visit `http://localhost:5173`

---

### Step 2: Install Core Dependencies

```bash
# Core dependencies
npm install @prisma/client zod

# AI & Embeddings
npm install openai @pinecone-database/pinecone

# PDF processing
npm install pdf-parse

# Authentication (bcrypt for password hashing)
npm install bcryptjs
npm install -D @types/bcryptjs

# State management
npm install @tanstack/svelte-query

# UI libraries
npm install -D tailwindcss postcss autoprefixer daisyui
npx tailwindcss init -p

# Development dependencies
npm install -D prisma @types/node @types/pdf-parse
```

---

### Step 3: Configure Tailwind CSS

**File:** `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: ['light', 'dark']
	}
};
```

**File:** `src/app.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**File:** `src/routes/+layout.svelte`

```svelte
<script>
	import '../app.css';
</script>

<slot />
```

---

### Step 4: Environment Variables

**File:** `.env`

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rag_db?schema=public"

# OpenAI
OPENAI_API_KEY="sk-..."

# Pinecone
PINECONE_API_KEY="..."
PINECONE_INDEX_NAME="documents"

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET="your-super-secret-key-here"
```

**File:** `.env.example` (commit this, not .env)

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/rag_db?schema=public"
OPENAI_API_KEY="sk-your-key-here"
PINECONE_API_KEY="your-key-here"
PINECONE_INDEX_NAME="documents"
SESSION_SECRET="generate-with-openssl-rand"
```

Add to `.gitignore`:

```bash
echo ".env" >> .gitignore
```

---

## Phase 2: Database Setup

### Step 5: Initialize Prisma

```bash
npx prisma init
```

This creates:

- `prisma/schema.prisma`
- `.env` file (if it doesn't exist)

---

### Step 6: Define Database Schema

**File:** `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  password  String    // Hashed password
  projects  Project[]
  files     File[]
  chats     Chat[]
  created   DateTime  @default(now())
  updated   DateTime  @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  files       File[]
  chats       Chat[]
  created     DateTime @default(now())
  updated     DateTime @updatedAt

  @@unique([ownerId, name])
}

model File {
  id          String   @id @default(cuid())
  name        String
  blobName    String   // Stored filename
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  status      String   @default("pending") // "pending" | "processing" | "success" | "failed"
  created     DateTime @default(now())

  @@unique([projectId, name])
}

model Chat {
  id        String    @id @default(cuid())
  name      String?
  projectId String
  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  messages  Message[]
  created   DateTime  @default(now())
  updated   DateTime  @updatedAt
}

model Message {
  id      String   @id @default(cuid())
  chatId  String
  chat    Chat     @relation(fields: [chatId], references: [id], onDelete: Cascade)
  role    String   // "user" | "assistant" | "system"
  content String   @db.Text
  created DateTime @default(now())
}
```

---

### Step 7: Create Database and Run Migration

```bash
# Create PostgreSQL database (if not using Docker)
createdb rag_db

# Or using Docker:
docker run --name rag-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=rag_db -p 5432:5432 -d postgres:15

# Run migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

**Verify:** Run `npx prisma studio` to view your database

---

### Step 8: Create Prisma Client Singleton

**File:** `src/lib/server/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
```

---

## Phase 3: Authentication System

### Step 9: Create Password Utilities

**File:** `src/lib/server/auth.ts`

```typescript
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export async function createUser(email: string, password: string, name?: string) {
	const hashedPassword = await hashPassword(password);

	return prisma.user.create({
		data: {
			email,
			password: hashedPassword,
			name
		}
	});
}

export async function authenticateUser(email: string, password: string) {
	const user = await prisma.user.findUnique({
		where: { email }
	});

	if (!user) return null;

	const isValid = await verifyPassword(password, user.password);
	if (!isValid) return null;

	return user;
}
```

---

### Step 10: Create Session Management

**File:** `src/lib/server/session.ts`

```typescript
import { prisma } from './prisma';

// In-memory session store (use Redis in production)
const sessions = new Map<string, string>();

export function createSession(userId: string): string {
	const sessionId = crypto.randomUUID();
	sessions.set(sessionId, userId);
	return sessionId;
}

export function getSession(sessionId: string): string | undefined {
	return sessions.get(sessionId);
}

export function deleteSession(sessionId: string): void {
	sessions.delete(sessionId);
}

export async function getUserFromSession(sessionId: string) {
	const userId = getSession(sessionId);
	if (!userId) return null;

	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			name: true,
			created: true
		}
	});
}
```

---

### Step 11: Setup Authentication Hook

**File:** `src/hooks.server.ts`

```typescript
import type { Handle } from '@sveltejs/kit';
import { getUserFromSession } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session');

	if (sessionId) {
		const user = await getUserFromSession(sessionId);
		if (user) {
			event.locals.user = user;
		}
	}

	return resolve(event);
};
```

**File:** `src/app.d.ts`

```typescript
declare global {
	namespace App {
		interface Locals {
			user?: {
				id: string;
				email: string;
				name: string | null;
				created: Date;
			};
		}
	}
}

export {};
```

---

### Step 12: Create Auth API Endpoints

**File:** `src/routes/api/auth/register/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { createUser } from '$lib/server/auth';
import { createSession } from '$lib/server/session';
import type { RequestHandler } from './$types';

const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().optional()
});

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const data = registerSchema.parse(body);

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { email: data.email }
		});

		if (existingUser) {
			return json({ error: 'User already exists' }, { status: 400 });
		}

		// Create user
		const user = await createUser(data.email, data.password, data.name);

		// Create session
		const sessionId = createSession(user.id);

		// Set cookie
		cookies.set('session', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		return json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name
			}
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid input' }, { status: 400 });
		}
		console.error(error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
```

**File:** `src/routes/api/auth/login/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { authenticateUser } from '$lib/server/auth';
import { createSession } from '$lib/server/session';
import type { RequestHandler } from './$types';

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string()
});

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const data = loginSchema.parse(body);

		// Authenticate
		const user = await authenticateUser(data.email, data.password);

		if (!user) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		// Create session
		const sessionId = createSession(user.id);

		// Set cookie
		cookies.set('session', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		return json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name
			}
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid input' }, { status: 400 });
		}
		console.error(error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
```

**File:** `src/routes/api/auth/logout/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get('session');

	if (sessionId) {
		deleteSession(sessionId);
	}

	cookies.delete('session', { path: '/' });

	return json({ success: true });
};
```

---

## Phase 4: AI Integration

### Step 13: Create OpenAI Client

**File:** `src/lib/server/openai.ts`

```typescript
import OpenAI from 'openai';

export const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
});

export async function createChatCompletion(
	messages: Array<{
		role: 'system' | 'user' | 'assistant';
		content: string;
	}>,
	options?: {
		model?: string;
		temperature?: number;
		maxTokens?: number;
	}
) {
	const response = await openai.chat.completions.create({
		model: options?.model || 'gpt-4o-mini',
		messages,
		temperature: options?.temperature ?? 0.7,
		max_tokens: options?.maxTokens ?? 1000
	});

	return response.choices[0].message.content || '';
}

export async function createEmbedding(text: string) {
	const response = await openai.embeddings.create({
		model: 'text-embedding-3-small',
		input: text
	});

	return response.data[0].embedding;
}
```

---

### Step 14: Setup Pinecone Vector Database

**File:** `src/lib/server/vectordb.ts`

```typescript
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
	apiKey: process.env.PINECONE_API_KEY || ''
});

const indexName = process.env.PINECONE_INDEX_NAME || 'documents';

export async function getIndex() {
	return pinecone.index(indexName);
}

export async function upsertVectors(
	vectors: Array<{
		id: string;
		values: number[];
		metadata: Record<string, any>;
	}>
) {
	const index = await getIndex();
	await index.upsert(vectors);
}

export async function queryVectors(
	vector: number[],
	options?: {
		topK?: number;
		filter?: Record<string, any>;
	}
) {
	const index = await getIndex();

	const results = await index.query({
		vector,
		topK: options?.topK || 5,
		filter: options?.filter,
		includeMetadata: true
	});

	return results.matches;
}

export async function deleteVectors(ids: string[]) {
	const index = await getIndex();
	await index.deleteMany(ids);
}
```

**Manual Step:** Create Pinecone Index

1. Go to https://app.pinecone.io/
2. Create new index:
   - Name: `documents`
   - Dimensions: `1536` (for text-embedding-3-small)
   - Metric: `cosine`
   - Environment: Select your region

---

### Step 15: Create Document Processing Service

**File:** `src/lib/server/documents.ts`

```typescript
import pdf from 'pdf-parse';
import { createEmbedding } from './openai';
import { upsertVectors } from './vectordb';
import { prisma } from './prisma';

export async function processDocument(fileBuffer: Buffer, fileId: string, projectId: string) {
	try {
		// Update status to processing
		await prisma.file.update({
			where: { id: fileId },
			data: { status: 'processing' }
		});

		// Extract text from PDF
		const data = await pdf(fileBuffer);
		const text = data.text;

		// Split into chunks
		const chunks = splitIntoChunks(text, 1000);

		// Generate embeddings
		const vectors = await Promise.all(
			chunks.map(async (chunk, index) => {
				const embedding = await createEmbedding(chunk);

				return {
					id: `${fileId}-chunk-${index}`,
					values: embedding,
					metadata: {
						text: chunk,
						fileId,
						projectId,
						chunkIndex: index
					}
				};
			})
		);

		// Store in vector database
		await upsertVectors(vectors);

		// Update status to success
		await prisma.file.update({
			where: { id: fileId },
			data: { status: 'success' }
		});

		return { success: true };
	} catch (error) {
		console.error('Error processing document:', error);

		// Update status to failed
		await prisma.file.update({
			where: { id: fileId },
			data: { status: 'failed' }
		});

		throw error;
	}
}

function splitIntoChunks(text: string, chunkSize: number): string[] {
	const chunks: string[] = [];

	// Split by sentences
	const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

	let currentChunk = '';

	for (const sentence of sentences) {
		if ((currentChunk + sentence).length > chunkSize) {
			if (currentChunk) {
				chunks.push(currentChunk.trim());
			}
			currentChunk = sentence;
		} else {
			currentChunk += sentence;
		}
	}

	if (currentChunk) {
		chunks.push(currentChunk.trim());
	}

	return chunks;
}
```

---

### Step 16: Create RAG Query Service

**File:** `src/lib/server/rag.ts`

```typescript
import { createEmbedding, createChatCompletion } from './openai';
import { queryVectors } from './vectordb';

export async function queryWithRAG(
	question: string,
	projectId: string,
	conversationHistory?: Array<{ role: string; content: string }>
) {
	// Generate embedding for the question
	const questionEmbedding = await createEmbedding(question);

	// Query vector database
	const results = await queryVectors(questionEmbedding, {
		topK: 3,
		filter: { projectId }
	});

	// Extract context from results
	const context = results
		.map((match) => match.metadata?.text || '')
		.filter(Boolean)
		.join('\n\n---\n\n');

	// Build messages array
	const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
		{
			role: 'system',
			content: `You are a helpful AI assistant. Answer questions based on the following context from uploaded documents.

If the context doesn't contain relevant information to answer the question, say so honestly.

Context:
${context}`
		}
	];

	// Add conversation history if provided
	if (conversationHistory) {
		messages.push(
			...conversationHistory.map((msg) => ({
				role: msg.role as 'user' | 'assistant',
				content: msg.content
			}))
		);
	}

	// Add current question
	messages.push({
		role: 'user',
		content: question
	});

	// Generate response
	const response = await createChatCompletion(messages);

	return {
		answer: response,
		sources: results.map((match) => ({
			text: match.metadata?.text || '',
			score: match.score || 0,
			fileId: match.metadata?.fileId
		}))
	};
}
```

---

## Phase 5: API Endpoints

### Step 17: Project Management APIs

**File:** `src/routes/api/projects/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

const createProjectSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().optional()
});

// GET - List all projects for user
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const projects = await prisma.project.findMany({
		where: { ownerId: locals.user.id },
		include: {
			_count: {
				select: { files: true, chats: true }
			}
		},
		orderBy: { created: 'desc' }
	});

	return json({ projects });
};

// POST - Create new project
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const data = createProjectSchema.parse(body);

		const project = await prisma.project.create({
			data: {
				name: data.name,
				description: data.description,
				ownerId: locals.user.id
			}
		});

		return json({ project }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid input' }, { status: 400 });
		}
		console.error(error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
```

**File:** `src/routes/api/projects/[id]/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

// GET - Get single project
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const project = await prisma.project.findFirst({
		where: {
			id: params.id,
			ownerId: locals.user.id
		},
		include: {
			files: {
				orderBy: { created: 'desc' }
			},
			chats: {
				orderBy: { updated: 'desc' }
			}
		}
	});

	if (!project) {
		return json({ error: 'Project not found' }, { status: 404 });
	}

	return json({ project });
};

// DELETE - Delete project
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		await prisma.project.delete({
			where: {
				id: params.id,
				ownerId: locals.user.id
			}
		});

		return json({ success: true });
	} catch (error) {
		return json({ error: 'Project not found' }, { status: 404 });
	}
};
```

---

### Step 18: File Upload API

**File:** `src/routes/api/upload/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '$lib/server/prisma';
import { processDocument } from '$lib/server/documents';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const projectId = formData.get('projectId') as string;

		if (!file || !projectId) {
			return json({ error: 'Missing file or projectId' }, { status: 400 });
		}

		// Verify project ownership
		const project = await prisma.project.findFirst({
			where: {
				id: projectId,
				ownerId: locals.user.id
			}
		});

		if (!project) {
			return json({ error: 'Project not found' }, { status: 404 });
		}

		// Generate unique filename
		const timestamp = Date.now();
		const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
		const blobName = `${timestamp}-${safeFilename}`;

		// Save file to disk
		const uploadDir = join(process.cwd(), 'uploads');
		await mkdir(uploadDir, { recursive: true });

		const filepath = join(uploadDir, blobName);
		const buffer = Buffer.from(await file.arrayBuffer());
		await writeFile(filepath, buffer);

		// Create file record
		const dbFile = await prisma.file.create({
			data: {
				name: file.name,
				blobName,
				projectId,
				status: 'pending'
			}
		});

		// Process document asynchronously (don't await)
		processDocument(buffer, dbFile.id, projectId).catch((error) => {
			console.error('Error processing document:', error);
		});

		return json(
			{
				file: {
					id: dbFile.id,
					name: dbFile.name,
					status: dbFile.status
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: 'Upload failed' }, { status: 500 });
	}
};
```

---

### Step 19: Chat APIs

**File:** `src/routes/api/chats/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

const createChatSchema = z.object({
	projectId: z.string(),
	name: z.string().optional()
});

// POST - Create new chat
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const data = createChatSchema.parse(body);

		// Verify project ownership
		const project = await prisma.project.findFirst({
			where: {
				id: data.projectId,
				ownerId: locals.user.id
			}
		});

		if (!project) {
			return json({ error: 'Project not found' }, { status: 404 });
		}

		const chat = await prisma.chat.create({
			data: {
				projectId: data.projectId,
				name: data.name || 'New Chat'
			}
		});

		return json({ chat }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid input' }, { status: 400 });
		}
		console.error(error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
```

**File:** `src/routes/api/chats/[id]/messages/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { prisma } from '$lib/server/prisma';
import { queryWithRAG } from '$lib/server/rag';
import type { RequestHandler } from './$types';

const sendMessageSchema = z.object({
	content: z.string().min(1)
});

// GET - Get all messages in chat
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const messages = await prisma.message.findMany({
		where: { chatId: params.id },
		orderBy: { created: 'asc' }
	});

	return json({ messages });
};

// POST - Send message and get AI response
export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const data = sendMessageSchema.parse(body);

		// Get chat with project info
		const chat = await prisma.chat.findUnique({
			where: { id: params.id },
			include: { project: true }
		});

		if (!chat) {
			return json({ error: 'Chat not found' }, { status: 404 });
		}

		// Verify project ownership
		if (chat.project.ownerId !== locals.user.id) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Save user message
		const userMessage = await prisma.message.create({
			data: {
				chatId: params.id,
				role: 'user',
				content: data.content
			}
		});

		// Get conversation history
		const history = await prisma.message.findMany({
			where: { chatId: params.id },
			orderBy: { created: 'asc' },
			take: 10 // Last 10 messages for context
		});

		// Query with RAG
		const result = await queryWithRAG(
			data.content,
			chat.projectId,
			history.slice(0, -1).map((msg) => ({
				role: msg.role,
				content: msg.content
			}))
		);

		// Save assistant message
		const assistantMessage = await prisma.message.create({
			data: {
				chatId: params.id,
				role: 'assistant',
				content: result.answer
			}
		});

		return json(
			{
				userMessage,
				assistantMessage,
				sources: result.sources
			},
			{ status: 201 }
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid input' }, { status: 400 });
		}
		console.error(error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
```

---

## Phase 6: Frontend Pages

### Step 20: Create Layout and Auth Pages

**File:** `src/routes/+layout.server.ts`

```typescript
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user || null
	};
};
```

**File:** `src/routes/login/+page.svelte`

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin() {
		loading = true;
		error = '';

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await res.json();

			if (res.ok) {
				goto('/dashboard');
			} else {
				error = data.error || 'Login failed';
			}
		} catch (err) {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}
</script>

<div class="bg-base-200 flex min-h-screen items-center justify-center">
	<div class="card bg-base-100 w-96 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Login</h2>

			{#if error}
				<div class="alert alert-error">{error}</div>
			{/if}

			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleLogin();
				}}
			>
				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text">Email</span>
					</label>
					<input id="email" type="email" bind:value={email} class="input input-bordered" required />
				</div>

				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">Password</span>
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						class="input input-bordered"
						required
					/>
				</div>

				<div class="form-control mt-6">
					<button type="submit" class="btn btn-primary" disabled={loading}>
						{loading ? 'Loading...' : 'Login'}
					</button>
				</div>
			</form>

			<p class="mt-4 text-center">
				Don't have an account?
				<a href="/register" class="link link-primary">Register</a>
			</p>
		</div>
	</div>
</div>
```

**File:** `src/routes/register/+page.svelte`

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let name = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleRegister() {
		loading = true;
		error = '';

		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, name })
			});

			const data = await res.json();

			if (res.ok) {
				goto('/dashboard');
			} else {
				error = data.error || 'Registration failed';
			}
		} catch (err) {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}
</script>

<div class="bg-base-200 flex min-h-screen items-center justify-center">
	<div class="card bg-base-100 w-96 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Register</h2>

			{#if error}
				<div class="alert alert-error">{error}</div>
			{/if}

			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleRegister();
				}}
			>
				<div class="form-control">
					<label class="label" for="name">
						<span class="label-text">Name</span>
					</label>
					<input id="name" type="text" bind:value={name} class="input input-bordered" />
				</div>

				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text">Email</span>
					</label>
					<input id="email" type="email" bind:value={email} class="input input-bordered" required />
				</div>

				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">Password (min 8 characters)</span>
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						class="input input-bordered"
						required
						minlength="8"
					/>
				</div>

				<div class="form-control mt-6">
					<button type="submit" class="btn btn-primary" disabled={loading}>
						{loading ? 'Loading...' : 'Register'}
					</button>
				</div>
			</form>

			<p class="mt-4 text-center">
				Already have an account?
				<a href="/login" class="link link-primary">Login</a>
			</p>
		</div>
	</div>
</div>
```

---

### Step 21: Create Dashboard (Project List)

**File:** `src/routes/dashboard/+page.server.ts`

```typescript
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	return {
		user: locals.user
	};
};
```

**File:** `src/routes/dashboard/+page.svelte`

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let projects = $state<any[]>([]);
	let loading = $state(true);
	let showCreateModal = $state(false);
	let newProjectName = $state('');
	let newProjectDescription = $state('');

	onMount(async () => {
		await loadProjects();
	});

	async function loadProjects() {
		loading = true;
		const res = await fetch('/api/projects');
		const result = await res.json();
		projects = result.projects || [];
		loading = false;
	}

	async function createProject() {
		const res = await fetch('/api/projects', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: newProjectName,
				description: newProjectDescription
			})
		});

		if (res.ok) {
			showCreateModal = false;
			newProjectName = '';
			newProjectDescription = '';
			await loadProjects();
		}
	}

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		goto('/login');
	}
</script>

<div class="bg-base-200 min-h-screen">
	<div class="navbar bg-base-100 shadow-lg">
		<div class="flex-1">
			<a href="/dashboard" class="btn btn-ghost text-xl">RAG Chat</a>
		</div>
		<div class="flex-none gap-2">
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
					<div
						class="bg-primary text-primary-content flex w-10 items-center justify-center rounded-full"
					>
						{data.user?.name?.[0] || data.user?.email?.[0] || 'U'}
					</div>
				</div>
				<ul
					tabindex="0"
					class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
				>
					<li><a onclick={logout}>Logout</a></li>
				</ul>
			</div>
		</div>
	</div>

	<div class="container mx-auto p-8">
		<div class="mb-8 flex items-center justify-between">
			<h1 class="text-3xl font-bold">My Projects</h1>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				+ New Project
			</button>
		</div>

		{#if loading}
			<div class="flex justify-center">
				<span class="loading loading-spinner loading-lg"></span>
			</div>
		{:else if projects.length === 0}
			<div class="alert">
				<span>No projects yet. Create your first project to get started!</span>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each projects as project}
					<a
						href="/projects/{project.id}"
						class="card bg-base-100 shadow-xl transition-shadow hover:shadow-2xl"
					>
						<div class="card-body">
							<h2 class="card-title">{project.name}</h2>
							<p class="text-sm opacity-70">{project.description || 'No description'}</p>
							<div class="card-actions mt-4 justify-end">
								<div class="badge badge-outline">{project._count.files} files</div>
								<div class="badge badge-outline">{project._count.chats} chats</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>

	{#if showCreateModal}
		<div class="modal modal-open">
			<div class="modal-box">
				<h3 class="text-lg font-bold">Create New Project</h3>
				<div class="form-control">
					<label class="label">
						<span class="label-text">Project Name</span>
					</label>
					<input
						type="text"
						bind:value={newProjectName}
						class="input input-bordered"
						placeholder="My Project"
					/>
				</div>
				<div class="form-control">
					<label class="label">
						<span class="label-text">Description (optional)</span>
					</label>
					<textarea
						bind:value={newProjectDescription}
						class="textarea textarea-bordered"
						placeholder="Project description..."
					></textarea>
				</div>
				<div class="modal-action">
					<button class="btn" onclick={() => (showCreateModal = false)}>Cancel</button>
					<button class="btn btn-primary" onclick={createProject}>Create</button>
				</div>
			</div>
		</div>
	{/if}
</div>
```

---

### Step 22: Create Project Detail Page (Chat Interface)

**File:** `src/routes/projects/[id]/+page.server.ts`

```typescript
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}
};
```

**File:** `src/routes/projects/[id]/+page.svelte`

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let projectId = $derived($page.params.id);

	let project = $state<any>(null);
	let chats = $state<any[]>([]);
	let currentChat = $state<any>(null);
	let messages = $state<any[]>([]);
	let files = $state<any[]>([]);
	let messageInput = $state('');
	let loading = $state(false);

	onMount(async () => {
		await loadProject();
	});

	async function loadProject() {
		const res = await fetch(`/api/projects/${projectId}`);
		const data = await res.json();
		project = data.project;
		files = data.project.files || [];
		chats = data.project.chats || [];

		if (chats.length > 0) {
			await selectChat(chats[0].id);
		}
	}

	async function selectChat(chatId: string) {
		const chat = chats.find((c) => c.id === chatId);
		currentChat = chat;

		const res = await fetch(`/api/chats/${chatId}/messages`);
		const data = await res.json();
		messages = data.messages || [];
	}

	async function createNewChat() {
		const res = await fetch('/api/chats', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				projectId,
				name: 'New Chat'
			})
		});

		const data = await res.json();
		chats = [data.chat, ...chats];
		await selectChat(data.chat.id);
	}

	async function sendMessage() {
		if (!messageInput.trim() || !currentChat) return;

		loading = true;
		const content = messageInput;
		messageInput = '';

		// Add user message optimistically
		messages = [...messages, { role: 'user', content, created: new Date() }];

		try {
			const res = await fetch(`/api/chats/${currentChat.id}/messages`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content })
			});

			const data = await res.json();

			// Replace optimistic message and add assistant response
			messages = [...messages.slice(0, -1), data.userMessage, data.assistantMessage];
		} catch (error) {
			console.error(error);
			// Remove optimistic message on error
			messages = messages.slice(0, -1);
		} finally {
			loading = false;
		}
	}

	async function uploadFile(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('file', file);
		formData.append('projectId', projectId);

		const res = await fetch('/api/upload', {
			method: 'POST',
			body: formData
		});

		if (res.ok) {
			await loadProject();
		}
	}
</script>

<div class="bg-base-200 flex h-screen">
	<!-- Sidebar -->
	<div class="bg-base-100 flex w-64 flex-col shadow-lg">
		<div class="border-b p-4">
			<a href="/dashboard" class="btn btn-ghost btn-sm">← Back</a>
			<h2 class="mt-2 text-lg font-bold">{project?.name || 'Loading...'}</h2>
		</div>

		<!-- Files Section -->
		<div class="border-b p-4">
			<h3 class="mb-2 font-semibold">Files ({files.length})</h3>
			<input
				type="file"
				accept=".pdf"
				onchange={uploadFile}
				class="file-input file-input-bordered file-input-sm w-full"
			/>
			<div class="mt-2 space-y-1">
				{#each files as file}
					<div class="bg-base-200 rounded p-2 text-sm">
						<div class="truncate">{file.name}</div>
						<div class="text-xs opacity-60">{file.status}</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Chats Section -->
		<div class="flex-1 overflow-y-auto p-4">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="font-semibold">Chats</h3>
				<button class="btn btn-ghost btn-xs" onclick={createNewChat}>+</button>
			</div>
			<div class="space-y-1">
				{#each chats as chat}
					<button
						class="btn btn-ghost btn-sm w-full justify-start"
						class:btn-active={currentChat?.id === chat.id}
						onclick={() => selectChat(chat.id)}
					>
						{chat.name}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Chat Area -->
	<div class="flex flex-1 flex-col">
		{#if currentChat}
			<!-- Messages -->
			<div class="flex-1 space-y-4 overflow-y-auto p-4">
				{#each messages as message}
					<div
						class="chat"
						class:chat-start={message.role === 'assistant'}
						class:chat-end={message.role === 'user'}
					>
						<div class="chat-bubble" class:chat-bubble-primary={message.role === 'user'}>
							{message.content}
						</div>
					</div>
				{/each}

				{#if loading}
					<div class="chat chat-start">
						<div class="chat-bubble">
							<span class="loading loading-dots"></span>
						</div>
					</div>
				{/if}
			</div>

			<!-- Input -->
			<div class="bg-base-100 border-t p-4">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						sendMessage();
					}}
					class="flex gap-2"
				>
					<input
						type="text"
						bind:value={messageInput}
						placeholder="Ask a question about your documents..."
						class="input input-bordered flex-1"
						disabled={loading || files.filter((f) => f.status === 'success').length === 0}
					/>
					<button
						type="submit"
						class="btn btn-primary"
						disabled={loading ||
							!messageInput.trim() ||
							files.filter((f) => f.status === 'success').length === 0}
					>
						Send
					</button>
				</form>
				{#if files.filter((f) => f.status === 'success').length === 0}
					<p class="mt-2 text-center text-sm opacity-60">
						Upload and process at least one document to start chatting
					</p>
				{/if}
			</div>
		{:else}
			<div class="flex flex-1 items-center justify-center">
				<div class="text-center">
					<p class="text-lg opacity-60">No chat selected</p>
					<button class="btn btn-primary mt-4" onclick={createNewChat}> Create New Chat </button>
				</div>
			</div>
		{/if}
	</div>
</div>
```

---

## Phase 7: Testing & Deployment

### Step 23: Test Your Application

```bash
# Run development server
npm run dev

# Test the flow:
# 1. Register a new account at http://localhost:5173/register
# 2. Create a project
# 3. Upload a PDF file
# 4. Wait for processing (check file status)
# 5. Create a chat
# 6. Ask questions about the document
```

---

### Step 24: Add Gitignore

**File:** `.gitignore`

```
node_modules
.env
.env.*
!.env.example
dist
build
.svelte-kit
uploads/
.DS_Store
*.log
```

---

### Step 25: Create README

**File:** `README.md`

````markdown
# RAG Document Chat Application

AI-powered document Q&A system with RAG (Retrieval Augmented Generation).

## Features

- User authentication
- Project management
- PDF document upload & processing
- AI-powered chat with document context
- Vector similarity search

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
````

2. Set up PostgreSQL database

3. Configure environment variables (copy `.env.example` to `.env`)

4. Create Pinecone index (dimensions: 1536, metric: cosine)

5. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- SvelteKit + Svelte 5
- PostgreSQL + Prisma
- OpenAI API
- Pinecone Vector Database
- TailwindCSS + DaisyUI

````

---

### Step 26: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - DATABASE_URL (use Vercel Postgres or external provider)
# - OPENAI_API_KEY
# - PINECONE_API_KEY
# - PINECONE_INDEX_NAME
# - SESSION_SECRET

# Deploy to production
vercel --prod
````

**For Database**: Use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or [Neon](https://neon.tech/) (free tier)

---

## 🎉 You're Done!

### What You've Built:

✅ Full-stack TypeScript application with SvelteKit
✅ User authentication with sessions
✅ Project and file management
✅ PDF upload and processing
✅ Vector embeddings with Pinecone
✅ RAG-powered AI chat
✅ Responsive UI with Tailwind + DaisyUI
✅ Production-ready deployment

### Next Steps:

1. Add real-time file processing updates (SSE)
2. Implement file deletion
3. Add citation highlighting
4. Export chats to PDF/Word
5. Add usage analytics
6. Implement rate limiting
7. Add tests (Playwright + Vitest)

---

## Troubleshooting

### Common Issues:

**Database connection error:**

- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running

**OpenAI API error:**

- Check API key is valid
- Verify you have credits

**Pinecone error:**

- Ensure index dimensions match (1536)
- Check API key and index name

**File upload not processing:**

- Check `uploads/` directory exists and is writable
- Check server logs for errors

---

**Total Build Time Estimate**: 8-12 hours for MVP

**Good luck! 🚀**
