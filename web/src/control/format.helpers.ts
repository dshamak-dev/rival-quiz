export function enumToLabel(value: string): string {
	return value
		.split('_')
		.map((word) => word.trim())
		.join(' ');
}

export function formatDecimal(value: string | number, decimalPlaces: number = 2): string {
	const numberValue = !isNaN(Number(value)) ? Number(value) : 0;
	const formattedValue = numberValue % 1 > 0 ? `${numberValue.toFixed(decimalPlaces)}` : `${numberValue.toFixed(0)}`;

	return formattedValue;
}
