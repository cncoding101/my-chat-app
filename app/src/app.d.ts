declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			validated?: {
				body?: unknown;
				query?: unknown;
				params?: unknown;
			};
		}
	}
}

// CSS Modules type declaration
declare module '*.module.css' {
	const classes: { [key: string]: string };
	export default classes;
}

export {};
