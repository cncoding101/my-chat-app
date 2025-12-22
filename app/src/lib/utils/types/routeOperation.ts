import type { z } from 'zod';

export interface RouteOperation {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	description?: string;
	body?: z.ZodType;
	query?: z.ZodType;
	params?: z.ZodType;
	response?: z.ZodType;
}

/**
 * Metadata exported from route files
 * Routes should export this as `_meta`
 */
export interface RouteMetadata {
	operations: RouteOperation[];
}

export interface ValidationResult {
	valid: boolean;
	data?: {
		body?: unknown;
		query?: unknown;
		params?: unknown;
	};
	errors?: Array<{
		field: string;
		message: string;
	}>;
}
