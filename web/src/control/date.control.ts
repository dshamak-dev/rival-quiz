export function getGreetingText() {
	const date = new Date();
	const hours = date.getHours();

	if (hours < 12) {
		return 'good morning';
	} else if (hours < 18) {
		return 'how are you doing?';
	} else {
		return 'good evening';
	}
}

export type DateFormatType = 'MM/DD/YYYY' | 'DD/MM/YYYY h:m:s' | 'DD/MM/YY' | undefined;
const datePartsFilters: Record<string, RegExp> = {
	day: /DD/g,
	month: /MM/g,
	year: /YYYY/g,
	yearShort: /YY/g,
	hours: /h/g,
	minutes: /m/g,
	seconds: /s/g,
};

export function formatDate(value: Date | string | number, format: DateFormatType = 'MM/DD/YYYY'): string | null {
	if (!value) {
		return null;
	}

	const date = new Date(value);
	const parts = parseDate(date);

	return Object.entries(parts).reduce((accum: string, [key, value]) => {
		const reg = datePartsFilters[key];

		if (reg) {
			accum = accum.replace(reg, value);
		}

		return accum;
	}, format as string);
}

export type DateParts = { day: string; month: string; year: string; hours: string; minutes: string; seconds: string };
function parseDate(date: Date): DateParts {
	const day = date.getDate();
	const month = String(date.getMonth() + 1);
	const year = date.getFullYear();
	const yearShort = year.toString().slice(-2);
	const hours = String(date.getHours());
	const minutes = String(date.getMinutes());
	const seconds = String(date.getSeconds());

	return Object.entries({ day, month, year, hours, minutes, seconds, yearShort }).reduce((accum, [key, value]) => {
		accum[key] = prettyDateNumber(value);

		return accum;
	}, {} as any);
}

export function prettyDateNumber(num: number | string): string {
	return String(num).padStart(2, '0');
}
