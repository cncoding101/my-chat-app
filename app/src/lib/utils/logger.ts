import { createConsola } from 'consola';

export const logger = createConsola({
	level: 3, // info
	formatOptions: {
		date: true,
		colors: true
	}
});

// Wrap console logs
logger.wrapConsole();
