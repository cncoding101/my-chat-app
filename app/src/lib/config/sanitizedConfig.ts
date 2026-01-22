import { z } from 'zod';
import { publicEnv } from '$lib/schemas/env';
import { env as publicEnvDynamic } from '$env/dynamic/public';

/**
 * Client-safe configuration that can be imported from both client and server code.
 * Uses SvelteKit's $env/dynamic/public to access PUBLIC_ prefixed environment variables.
 *
 * For server-only configuration, use sanitizedConfig.server.ts instead.
 */
const validatePublicConfig = (): PublicConfig => {
	try {
		return publicEnv.parse(publicEnvDynamic);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.issues
				.map((err) => {
					const path = err.path.join('.');
					const message = err.message;
					return `${path}: ${message}`;
				})
				.join('\n');

			throw new Error(`Public environment configuration validation failed:\n${errorMessages}`);
		}
		throw error;
	}
};

export type PublicConfig = z.infer<typeof publicEnv>;

const publicConfig = validatePublicConfig();
export default publicConfig;
export { publicConfig };
