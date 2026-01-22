import { z } from 'zod';

type Store = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

const isBrowser = typeof window !== 'undefined';

const defaultStore: Store = isBrowser
	? localStorage
	: {
			getItem: () => null,
			setItem: () => {},
			removeItem: () => {}
		}; // TODO server side rendering storage

/**
 * Helper to find first non-null value from a list of keys
 */
const firstValue = <Key, Value>(args: Key[], get: (arg: Key) => Value) => {
	for (const arg of args) {
		const value = get(arg);
		if (value != null) {
			return { foundAt: arg, value };
		}
	}
	return null;
};

const getParsedStoreValue = (value: string) => {
	if (value === 'undefined') {
		return { value: undefined };
	}
	try {
		return { value: JSON.parse(value) };
	} catch (error) {
		return { error, value };
	}
};

/**
 * Create a type-safe storage interface with Zod validation
 * The schema keys become the storage keys - no need to define them separately!
 */
export const createStorageInterface = <const TSchema extends Record<string, z.ZodTypeAny>>({
	schema,
	captureException = console.error,
	store = defaultStore
}: {
	schema: TSchema;
	captureException?: (error: unknown) => void;
	store?: Store;
}) => {
	type SchemaKey = Extract<keyof TSchema, string>;

	return {
		/**
		 * Get a value from storage with validation
		 *
		 * Returns the validated value or throws an error if:
		 * - The key doesn't exist and schema has no default
		 * - The stored value is invalid
		 * - Parsing fails
		 *
		 * Note: Schemas with .default() will return their default value
		 * when the key doesn't exist in storage, and the return type
		 * will be non-nullable.
		 */
		get: <TKey extends SchemaKey>(key: TKey, ...fallbackKeys: string[]): z.infer<TSchema[TKey]> => {
			const storeValue = firstValue([key, ...fallbackKeys], store.getItem.bind(store));

			const zodSchema = schema[key];

			// If no value in storage, try to use schema default (if defined)
			if (storeValue == null) {
				const validated = zodSchema.parse(undefined);
				store.setItem(key, JSON.stringify(validated));
				return validated;
			}

			const parsedValue = getParsedStoreValue(storeValue.value);

			try {
				const validated = zodSchema.parse(parsedValue.value);

				// Migrate to new key if found in fallback
				const shouldMigrateToNewKey = key !== storeValue.foundAt;
				if (shouldMigrateToNewKey) {
					store.setItem(key, storeValue.value);
					store.removeItem(storeValue.foundAt);
				}

				return validated;
			} catch (error) {
				const err = new Error(`Failed to validate value for ${key}`);
				if (parsedValue.error == null) {
					err.cause = error;
				} else {
					err.cause = parsedValue.error;
				}
				captureException(err);
				throw err;
			}
		},

		set: <TKey extends SchemaKey>(key: TKey, value: z.infer<TSchema[TKey]>): void => {
			const zodSchema = schema[key];
			try {
				const validated = zodSchema.parse(value);
				store.setItem(key, JSON.stringify(validated));
			} catch (error) {
				captureException(error);
				throw new Error(`Failed to set value for ${key}`);
			}
		},

		remove: <TKey extends SchemaKey>(key: TKey): void => {
			store.removeItem(key);
		},

		has: <TKey extends SchemaKey>(key: TKey): boolean => {
			return store.getItem(key) !== null;
		}
	} as const;
};
