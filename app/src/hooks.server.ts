import { json, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { routeRegistry, validateRequest, validateResponse } from '$lib/utils/helpers/api';
import '$lib/utils/logger';

// const whitelistedDomains = [];

const whitelistedConnectSrc = [
	"'self'",
	'https://api.iconify.design',
	'https://api.simplesvg.com',
	'https://api.unisvg.com'
].join(' ');

const handleApiValidation: Handle = async ({ event, resolve }) => {
	const method = event.request.method;
	const pathname = event.url.pathname;

	const metadata = await routeRegistry.getMetadata(pathname, method);

	if (metadata == null) {
		return resolve(event);
	}

	const validationOptions: {
		body?: unknown;
		query?: Record<string, string>;
		params?: Record<string, string>;
	} = {};

	if (['POST', 'PUT', 'PATCH'].includes(method) && metadata.body != null) {
		const contentType = event.request.headers.get('content-type');

		if (contentType?.includes('application/json') === true) {
			try {
				const clonedRequest = event.request.clone();
				validationOptions.body = await clonedRequest.json();
			} catch (error) {
				return json(
					{
						error: 'Invalid JSON in request body',
						details: error instanceof Error ? error.message : 'Unknown error'
					},
					{ status: 400 }
				);
			}
		}
	}

	if (metadata.query != null) {
		const query: Record<string, string> = {};
		event.url.searchParams.forEach((value, key) => {
			query[key] = value;
		});
		validationOptions.query = query;
	}

	if (metadata.params != null && Object.keys(event.params).length > 0) {
		validationOptions.params = event.params;
	}

	const validationResult = validateRequest(metadata, validationOptions);
	if (!validationResult.valid) {
		const errorSummary =
			validationResult.errors?.map((e) => ({
				field: e.field,
				type: e.message
			})) != null || [];
		console.error('[API Validation Failed]', {
			url: event.url.pathname,
			method: event.request.method,
			errors: errorSummary
		});
		return json(
			{
				error: 'Validation failed',
				details: validationResult.errors
			},
			{ status: 400 }
		);
	}

	if (validationResult.data != null) {
		// eslint-disable-next-line no-param-reassign
		event.locals.validated = validationResult.data;
	}

	// Resolve the request and validate the response if schema is defined
	const response = await resolve(event);

	// Only validate JSON responses
	const contentType = response.headers.get('content-type');
	if (metadata.response != null && (contentType?.includes('application/json') ?? false)) {
		try {
			// Clone the response to read the body
			const clonedResponse = response.clone();
			const responseData = await clonedResponse.json();

			// Validate the response
			const validatedResponseData = validateResponse(metadata, responseData);

			const headers = new Headers(response.headers);
			headers.delete('content-length');
			headers.delete('content-type');
			headers.delete('content-encoding');

			// Return a new response with validated data
			return json(validatedResponseData, {
				status: response.status,
				statusText: response.statusText,
				headers
			});
		} catch (error) {
			// Log the error and return 500
			console.error('[API Response Validation Failed]', {
				url: event.url.pathname,
				method: event.request.method,
				error: error instanceof Error ? error.message : 'Unknown error'
			});
			return json(
				{
					error: 'Response validation failed',
					details: error instanceof Error ? error.message : 'Unknown error'
				},
				{ status: 500 }
			);
		}
	}

	return response;
};

export const handle: Handle = sequence(handleApiValidation, async ({ event, resolve }) => {
	try {
		const response = await resolve(event);
		response.headers.set(
			'Content-Security-Policy',
			"default-src 'self'; " +
				"script-src 'self' 'unsafe-inline'; " +
				"style-src 'self' 'unsafe-inline'; " +
				"style-src-attr 'self' 'unsafe-inline'; " +
				"img-src 'self' data: https://*.blob.core.windows.net; " +
				"font-src 'self'; " +
				"worker-src 'self' blob:; " +
				`connect-src ${whitelistedConnectSrc}; ` +
				`frame-src 'self' http://localhost:*;`
		);
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('X-Frame-Options', 'DENY');
		response.headers.set('Cache-Control', 'no-cache');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=31536000; includeSubDomains; preload'
		);

		return response;
	} catch (error) {
		console.error(error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
});
