export const unreachable = (value: never): never => {
	throw new Error(`unreachable: ${value}`);
};

export const unreachableButIgnore = (): void => {
	/* ignore */
};

export const unreachableWithReturn = <T>(_: never, value: T): T => {
	return value;
};
