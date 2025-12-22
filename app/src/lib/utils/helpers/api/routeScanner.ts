import { routeRegistry } from '$lib/utils/helpers/api';
import type { RouteMetadata } from '$lib/utils/types';
import { dev } from '$app/environment';

/**
 * Automatically scan and register all API routes from the routes/api directory
 * Uses Vite's import.meta.glob to statically discover route files at build time
 */
export const scanAndRegisterRoutes = async (): Promise<
	Array<{ path: string; metadata: RouteMetadata }>
> => {
	// Use import.meta.glob to find all +server.ts files in routes/api
	// This is statically analyzed at build time by Vite
	const modules = import.meta.glob('/src/routes/api/**/*.ts', { eager: false });

	const registrations: Array<{ path: string; metadata: RouteMetadata }> = [];

	// Import each module and check for _meta export
	for (const [filePath, importFn] of Object.entries(modules)) {
		try {
			const module = (await importFn()) as { _meta?: RouteMetadata };

			if (module._meta != null) {
				// Convert file path to route path
				// /src/routes/api/users/+server.ts -> /api/users
				// /src/routes/api/users/[id]/+server.ts -> /api/users/[id]
				const routePath = filePathToRoutePath(filePath);

				registrations.push({
					path: routePath,
					metadata: module._meta
				});

				// Register the route
				routeRegistry.register(routePath, module._meta);
			}
		} catch (error) {
			console.error(`Failed to import and register route: ${filePath}`, error);
		}
	}

	// Log registered routes for debugging
	if (dev) {
		console.log(`🚀 Registered ${registrations.length} API routes:`);
		registrations.forEach(({ path, metadata }) => {
			const methods = metadata.operations.map((op) => op.method).join(', ');
			console.log(`  ${path} [${methods}]`);
		});
	}

	return registrations;
};

/**
 * Convert a file path to a SvelteKit route path
 * @param filePath - The file path (e.g., '/src/routes/api/users/[id]/+server.ts')
 * @returns The route path (e.g., '/api/users/[id]')
 */
const filePathToRoutePath = (filePath: string): string => {
	// Remove the file system prefix and extension
	let routePath = filePath
		.replace(/^\/src\/routes/, '') // Remove /src/routes prefix
		.replace(/\/\+server\.ts$/, '') // Remove /+server.ts suffix
		.replace(/\/\+server\.js$/, ''); // Also handle .js in case of build output

	if (!routePath.startsWith('/')) {
		routePath = '/' + routePath;
	}

	if (routePath === '/') {
		routePath = '/';
	}

	return routePath;
};
