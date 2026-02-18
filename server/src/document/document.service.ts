import { Injectable, BadRequestException } from '@nestjs/common';
import { DocumentRepository } from './document.repository';

const WORKER_URL = process.env.WORKER_URL ?? 'http://localhost:8000';

@Injectable()
export class DocumentService {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async ingestFile(file: Express.Multer.File) {
    const formData = new FormData();
    const uint8 = new Uint8Array(file.buffer);
    const blob = new Blob([uint8], { type: file.mimetype });
    formData.append('file', blob, file.originalname);

    const response = await fetch(`${WORKER_URL}/documents/ingest`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new BadRequestException(`Document ingestion failed: ${error}`);
    }

    const result = (await response.json()) as {
      document_id: string;
      filename: string;
      chunk_count: number;
      status: string;
    };

    return this.documentRepository.create({
      id: result.document_id,
      filename: result.filename,
      type: this.getDocumentType(file.originalname),
      status: result.status,
      chunkCount: result.chunk_count,
    });
  }

  async ingestURL(url: string) {
    const response = await fetch(`${WORKER_URL}/documents/ingest-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new BadRequestException(`URL ingestion failed: ${error}`);
    }

    const result = (await response.json()) as {
      document_id: string;
      filename: string;
      chunk_count: number;
      status: string;
    };

    return this.documentRepository.create({
      id: result.document_id,
      filename: url,
      type: 'web',
      status: result.status,
      chunkCount: result.chunk_count,
    });
  }

  async findAll() {
    return this.documentRepository.findAll();
  }

  async remove(id: string) {
    try {
      await fetch(`${WORKER_URL}/documents/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete from worker:', error);
    }

    const result = await this.documentRepository.remove(id);
    if (!result) {
      throw new BadRequestException('Failed to delete document');
    }

    return { success: true };
  }

  private getDocumentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pdf';
    if (['md', 'markdown'].includes(ext)) return 'markdown';
    if (['txt', 'csv', 'json', 'xml'].includes(ext)) return 'text';
    if (['html', 'htm'].includes(ext)) return 'html';
    return 'text';
  }
}
