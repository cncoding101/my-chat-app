import type { RouteMetadata } from '$lib/utils/types';

/**
 * Registry for storing route metadata
 * Routes register themselves by calling register()
 */
class RouteRegistry {
	private routes = new Map<string, RouteMetadata>();
	private initialized = false;
	private initPromise: Promise<void> | null = null;

	/**
	 * Register a route's metadata
	 * @param path - The route path with SvelteKit patterns (e.g., '/api/users/[id]')
	 * @param metadata - The route's validation metadata
	 */
	register(path: string, metadata: RouteMetadata): void {
		this.routes.set(path, metadata);
	}

	/**
	 * Initialize the registry by scanning routes
	 * This runs once when the registry is created
	 */
	public async init(): Promise<void> {
		if (this.initialized) {
			return;
		}

		if (this.initPromise != null) {
			return this.initPromise;
		}

		this.initPromise = (async () => {
			const { scanAndRegisterRoutes } = await import('./routeScanner');
			await scanAndRegisterRoutes();
			this.initialized = true;
		})();

		return this.initPromise;
	}

	async getMetadata(path: string, method: string) {
		await this.init();

		const exactMatch = this.routes.get(path);
		if (exactMatch != null) {
			return exactMatch.operations.find((op) => op.method === method.toUpperCase());
		}

		// Try pattern matching for dynamic routes
		for (const [pattern, metadata] of this.routes.entries()) {
			if (this.matchesPattern(pattern, path)) {
				return metadata.operations.find((op) => op.method === method.toUpperCase());
			}
		}

		return null;
	}

	private matchesPattern(pattern: string, path: string): boolean {
		// Convert SvelteKit pattern to regex
		// [id] -> [^/]+, [slug] -> [^/]+, etc.
		const regexPattern = pattern
			.replace(/\[([^\]]+)\]/g, '([^/]+)') // Replace [param] with capture group
			.replace(/\//g, '\\/'); // Escape forward slashes

		const regex = new RegExp(`^${regexPattern}$`);
		return regex.test(path);
	}
}

export const routeRegistry = new RouteRegistry();
