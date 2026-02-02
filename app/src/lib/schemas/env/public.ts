import { z } from 'zod';
import ENVIRONMENT from '../../utils/constants/environment';

/**
 * Schema for public environment variables accessible on both client and server
 * These must all be prefixed with PUBLIC_ in your .env file
 */
export const publicEnv = z.object({
	PUBLIC_APP_NAME: z.string().default('my-chat-app'),
	PUBLIC_APP_URL: z.string().default('http://localhost:5173'),

	// Environment
	PUBLIC_ENVIRONMENT: z
		.enum([ENVIRONMENT.DEVELOPMENT, ENVIRONMENT.STAGING, ENVIRONMENT.PRODUCTION])
		.default(ENVIRONMENT.DEVELOPMENT)
});

export type PublicEnv = z.infer<typeof publicEnv>;
