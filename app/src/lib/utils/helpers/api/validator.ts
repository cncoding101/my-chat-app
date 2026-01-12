import { z } from 'zod';
import type { RouteOperation, ValidationResult } from '$lib/utils/types';

const formatZodErrors = (
	error: z.ZodError,
	fieldPrefix: string
): Array<{ field: string; message: string }> => {
	return error.issues.map((err) => {
		const field = err.path.length > 0 ? `${fieldPrefix}.${err.path.join('.')}` : fieldPrefix;
		return {
			field,
			message: err.message
		};
	});
};

const validateRequest = (
	metadata: RouteOperation,
	options: {
		body?: unknown;
		query?: Record<string, string>;
		params?: Record<string, string>;
	}
): ValidationResult => {
	const validatedData: { body?: unknown; query?: unknown; params?: unknown } = {};
	const allErrors: Array<{ field: string; message: string }> = [];

	// Validate body if schema is provided
	if (metadata.body != null && options.body !== undefined) {
		const result = metadata.body.safeParse(options.body);
		if (result.success) {
			validatedData.body = result.data;
		} else {
			allErrors.push(...formatZodErrors(result.error, 'body'));
		}
	}

	// Validate query parameters if schema is provided
	if (metadata.query != null && options.query != null) {
		const result = metadata.query.safeParse(options.query);
		if (result.success) {
			validatedData.query = result.data;
		} else {
			allErrors.push(...formatZodErrors(result.error, 'query'));
		}
	}

	// Validate path parameters if schema is provided
	if (metadata.params != null && options.params != null) {
		const result = metadata.params.safeParse(options.params);
		if (result.success) {
			validatedData.params = result.data;
		} else {
			allErrors.push(...formatZodErrors(result.error, 'params'));
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
};

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
