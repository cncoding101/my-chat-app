import dotenv from 'dotenv';
import { z } from 'zod';
import { publicEnv } from '../schemas/env';

dotenv.config();
const schema = z.object({}).extend(publicEnv.shape);
const validateConfig = (): Env => {
	try {
		return schema.parse(process.env);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.issues
				.map((err) => {
					const path = err.path.join('.');
					const message = err.message;
					return `${path}: ${message}`;
				})
				.join('\n');

			throw new Error(`Environment configuration validation failed:\n${errorMessages}`);
		}
		throw error;
	}
};

export type Env = z.infer<typeof schema>;

const config = validateConfig();
export default config;
export { config };
