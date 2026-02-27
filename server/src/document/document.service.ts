import { Injectable, BadRequestException } from '@nestjs/common';
import { DocumentRepository } from './document.repository';
import {
	ingestDocument,
	ingestURL as workerIngestURL,
	deleteDocument
} from '../worker/clients/worker.client';

@Injectable()
export class DocumentService {
	constructor(private readonly documentRepository: DocumentRepository) {}

	async ingestFile(file: Express.Multer.File) {
		const uint8 = new Uint8Array(file.buffer);
		const blob = new Blob([uint8], { type: file.mimetype });

		const response = await ingestDocument({ file: blob });

		if (response.status !== 200) {
			throw new BadRequestException('Document ingestion failed');
		}

		const result = response.data;

		return this.documentRepository.create({
			id: result.document_id,
			filename: result.filename,
			type: this.getDocumentType(file.originalname),
			status: result.status,
			chunkCount: result.chunk_count
		});
	}

	async ingestURL(url: string) {
		const response = await workerIngestURL({ url });

		if (response.status !== 200) {
			throw new BadRequestException('URL ingestion failed');
		}

		const result = response.data;

		return this.documentRepository.create({
			id: result.document_id,
			filename: url,
			type: 'web',
			status: result.status,
			chunkCount: result.chunk_count
		});
	}

	async findAll() {
		return this.documentRepository.findAll();
	}

	async remove(id: string) {
		try {
			await deleteDocument(id);
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
