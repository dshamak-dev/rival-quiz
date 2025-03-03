import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';

type ChipProps = PropsWithChildren & {
	className?: string;
};

export function Chip({ children, className, ...props }: ChipProps) {
	if (children == null) {
		return null;
	}

	return (
		<Typography {...props} className={classNames(className, 'w-fit h-fit px-4 py-[0.25em]', 'border border-black/10 rounded-full')}>
			{children}
		</Typography>
	);
}
