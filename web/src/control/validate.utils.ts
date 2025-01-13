export function isNullOrEmpty(value: any): boolean {
	return value === null || value === undefined || value?.trim() === '';
}
