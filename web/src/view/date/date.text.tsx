import { formatDate } from '@control/date.control';
import { Typography } from '@view/typography/typography';
import { ComponentProps, useMemo } from 'react';

export type DateTextProps = {
	date: string | Date | number;
	format?: string;
} & ComponentProps<typeof Typography>;

export function DateText({ date, format, ...props }: DateTextProps) {
	const text = useMemo(() => {
		return formatDate(date, format);
	}, [date, format]);

	return <Typography {...props}>{text}</Typography>;
}
