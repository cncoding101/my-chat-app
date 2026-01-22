import z from 'zod';

const DEFAULT_USER_PREFERENCES = {
	sidebar: {
		isOpen: true
	},
	chat: {}
} as const;

export const schema = {
	userPreferences: z
		.object({
			sidebar: z.object({
				isOpen: z.boolean().default(true)
			}),
			chat: z.object({})
		})
		.default(DEFAULT_USER_PREFERENCES)
		.catch(DEFAULT_USER_PREFERENCES)
} as const;
