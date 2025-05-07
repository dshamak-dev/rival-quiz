export function mergeArrays<T>(...arrs: T[][]): T[] {
	const merge = new Set();

	arrs.forEach((arr) => {
		arr.forEach((it) => {
			merge.add(it);
		});
	});

	return Array.from(merge) as T[];
}

export function spreadRange(from: number, to: number): number[] {
	return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
