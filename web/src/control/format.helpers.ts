export function enumToLabel(value: string): string {
	return value
		.split('_')
		.map((word) => word.trim())
		.join(' ');
}
