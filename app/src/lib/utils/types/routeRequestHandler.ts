import type { RequestEvent } from '@sveltejs/kit';
import type { z } from 'zod';
import type { RouteMetadata } from './routeOperation';

// Extract the operation from the metadata based on the method
type ExtractOp<Meta extends RouteMetadata, Method extends string> = Extract<
	Meta['operations'][number],
	{ method: Method }
>;

// Extract the schemas
type ExtractBodySchema<Meta extends RouteMetadata, Method extends string> =
	ExtractOp<Meta, Method> extends { body: infer B } ? B : never;

type ExtractParamsSchema<Meta extends RouteMetadata, Method extends string> =
	ExtractOp<Meta, Method> extends { params: infer P } ? P : never;

type ExtractQuerySchema<Meta extends RouteMetadata, Method extends string> =
	ExtractOp<Meta, Method> extends { query: infer Q } ? Q : never;

// Infer the TS types from the Zod schemas
// Note: We check for [never] extends [T] pattern to handle the case where the schema doesn't exist
type InferBodyType<Meta extends RouteMetadata, Method extends string> = [
	ExtractBodySchema<Meta, Method>
] extends [never]
	? unknown
	: ExtractBodySchema<Meta, Method> extends z.ZodTypeAny
		? z.infer<ExtractBodySchema<Meta, Method>>
		: unknown;

type InferParamsType<Meta extends RouteMetadata, Method extends string> = [
	ExtractParamsSchema<Meta, Method>
] extends [never]
	? Record<string, string>
	: ExtractParamsSchema<Meta, Method> extends z.ZodTypeAny
		? z.infer<ExtractParamsSchema<Meta, Method>>
		: Record<string, string>;

type InferQueryType<Meta extends RouteMetadata, Method extends string> = [
	ExtractQuerySchema<Meta, Method>
] extends [never]
	? unknown
	: ExtractQuerySchema<Meta, Method> extends z.ZodTypeAny
		? z.infer<ExtractQuerySchema<Meta, Method>>
		: unknown;

// Custom Request with typed json()
type TypedRequest<Body> = Omit<Request, 'json'> & {
	json(): Promise<Body>;
};

/**
 * Typed validated data structure that matches what hooks.server.ts provides
 */
type TypedValidated<Meta extends RouteMetadata, Method extends string> = {
	body?: InferBodyType<Meta, Method>;
	query?: InferQueryType<Meta, Method>;
	params?: InferParamsType<Meta, Method>;
};

// Custom RequestEvent that allows passing the base Event type
// This enables compatibility with generated ./$types
type TypedRequestEvent<
	Meta extends RouteMetadata,
	Method extends string,
	Event extends RequestEvent
> = Omit<Event, 'request' | 'params' | 'locals'> & {
	request: TypedRequest<InferBodyType<Meta, Method>>;
	params: InferParamsType<Meta, Method>;
	locals: Omit<Event['locals'], 'validated'> & {
		validated?: TypedValidated<Meta, Method>;
	};
};

/**
 * A RequestHandler that infers types from the RouteMetadata.
 *
 * Usage:
 * export const POST: MetaRequestHandler<typeof _meta, 'POST'> = async ({ request, locals }) => {
 *   const body = await request.json(); // body is typed!
 *   const query = locals.validated?.query; // query is typed!
 * };
 *
 * Usage with generated types:
 * import type { RequestEvent } from './$types';
 * export const POST: MetaRequestHandler<typeof _meta, 'POST', RequestEvent> = ...
 */
export type MetaRequestHandler<
	Meta extends RouteMetadata,
	Method extends 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
	Event extends RequestEvent = RequestEvent
> = (event: TypedRequestEvent<Meta, Method, Event>) => Promise<Response>;
