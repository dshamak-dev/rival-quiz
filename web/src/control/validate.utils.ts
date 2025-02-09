export function isNullOrEmpty(value: any): boolean {
	const type = typeof value;

	switch (type) {
		case 'object':
			return value == null || Object.keys(value).length === 0;
		case 'string':
			return value.trim() === '';
		case 'number':
			return isNaN(value);
		default:
			return true;
	}
}
