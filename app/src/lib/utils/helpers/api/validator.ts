import { z } from 'zod';
import type { RouteOperation, ValidationResult } from '$lib/utils/types';

function formatZodErrors(
	error: z.ZodError,
	fieldPrefix: string
): Array<{ field: string; message: string }> {
	return error.issues.map((err) => {
		const field = err.path.length > 0 ? `${fieldPrefix}.${err.path.join('.')}` : fieldPrefix;
		return {
			field,
			message: err.message
		};
	});
}

function validateRequest(
	metadata: RouteOperation,
	options: {
		body?: unknown;
		query?: Record<string, string>;
		params?: Record<string, string>;
	}
): ValidationResult {
	const validatedData: { body?: unknown; query?: unknown; params?: unknown } = {};
	const allErrors: Array<{ field: string; message: string }> = [];

	// Validate body if schema is provided
	if (metadata.body && options.body !== undefined) {
		const result = metadata.body.safeParse(options.body);
		if (!result.success) {
			allErrors.push(...formatZodErrors(result.error, 'body'));
		} else {
			validatedData.body = result.data;
		}
	}

	// Validate query parameters if schema is provided
	if (metadata.query && options.query) {
		const result = metadata.query.safeParse(options.query);
		if (!result.success) {
			allErrors.push(...formatZodErrors(result.error, 'query'));
		} else {
			validatedData.query = result.data;
		}
	}

	// Validate path parameters if schema is provided
	if (metadata.params && options.params) {
		const result = metadata.params.safeParse(options.params);
		if (!result.success) {
			allErrors.push(...formatZodErrors(result.error, 'params'));
		} else {
			validatedData.params = result.data;
		}
	}

	// Return validation result
	if (allErrors.length > 0) {
		return {
			valid: false,
			errors: allErrors
		};
	}

	return {
		valid: true,
		data: validatedData
	};
}

/**
 * Validate a response against its schema
 * @param metadata - The route operation metadata
 * @param responseData - The response data to validate
 * @returns The validated response data or throws a	n error
 */
const validateResponse = (metadata: RouteOperation, responseData: unknown): unknown => {
	if (metadata.response == null) {
		// No schema defined, return as-is
		return responseData;
	}

	const result = metadata.response.safeParse(responseData);
	if (!result.success) {
		const errors = formatZodErrors(result.error, 'response');
		console.error('[API Response Validation Failed]', {
			errors
		});
		throw new Error(
			`Response validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`
		);
	}

	return result.data;
};

export { validateRequest, validateResponse };
