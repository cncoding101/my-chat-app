import dotenv from 'dotenv';
import { z } from 'zod';
import { publicEnv } from '$lib/schemas/env';

/**
 * Server-side validation for PUBLIC_ environment variables.
 * This runs at build time when imported in vite.config.ts
 *
 * Unlike sanitizedConfig.ts which uses $env/dynamic/public (only available in SvelteKit runtime),
 * this file uses process.env directly so it can be imported during Vite config loading.
 */

dotenv.config();
const validatePublicEnv = (): z.infer<typeof publicEnv> => {
	// Extract only PUBLIC_ prefixed environment variables
	const publicEnvVars = Object.keys(process.env)
		.filter((key) => key.startsWith('PUBLIC_'))
		.reduce(
			(acc, key) => {
				acc[key] = process.env[key];
				return acc;
			},
			{} as Record<string, string | undefined>
		);

	try {
		return publicEnv.parse(publicEnvVars);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.issues
				.map((err) => {
					const path = err.path.join('.');
					const message = err.message;
					return `${path}: ${message}`;
				})
				.join('\n');

			throw new Error(
				`Public environment variables validation failed:\n${errorMessages}\n\nMake sure all required PUBLIC_ environment variables are set in your .env file.`
			);
		}
		throw error;
	}
};

// Execute validation immediately when this module is imported
validatePublicEnv();
