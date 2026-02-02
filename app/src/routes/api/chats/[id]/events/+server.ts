import { chatEventBus } from '@/backend/event-bus.server';
import { chatIdParamSchema } from '@/schemas/api';
import type { RouteMetadata } from '@/utils/types';
import type { MetaRequestHandler } from '@/utils/types/routeRequestHandler';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export const _meta = {
	operations: [
		{
			method: 'GET',
			description: 'SSE endpoint for real-time chat message updates',
			params: chatIdParamSchema
		}
	]
} as const satisfies RouteMetadata;

/**
 * SSE endpoint for real-time chat message updates.
 * Clients connect here to receive new messages as they arrive.
 */
export const GET: MetaRequestHandler<typeof _meta, 'GET'> = async ({ params }) => {
	const { id: chatId } = params;

	const stream = new ReadableStream({
		start: (controller) => {
			const encoder = new TextEncoder();

			// Send initial connection message
			controller.enqueue(encoder.encode(`: connected to chat ${chatId}\n\n`));

			// Subscribe to chat events
			const unsubscribe = chatEventBus.subscribe(chatId, (event) => {
				// Use named SSE events for different types
				const data = JSON.stringify(event.data);
				controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${data}\n\n`));
			});

			// Heartbeat to keep connection alive
			const heartbeat = setInterval(() => {
				try {
					controller.enqueue(encoder.encode(`: heartbeat\n\n`));
				} catch {
					// Stream closed, cleanup will happen
				}
			}, HEARTBEAT_INTERVAL);

			// Cleanup when the client disconnects
			// Note: This is handled by the stream being closed
			const cleanup = () => {
				clearInterval(heartbeat);
				unsubscribe();
			};

			// Store cleanup function for when stream closes
			// The stream will be closed when the client disconnects
			// eslint-disable-next-line no-param-reassign
			controller.close = ((originalClose) => {
				return () => {
					cleanup();
					return originalClose.call(controller);
				};
			})(controller.close);
		},
		cancel: () => {
			// Called when the client disconnects
			// Cleanup is handled in the close override above
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
