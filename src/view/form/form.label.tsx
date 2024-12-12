import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';

export type FormLabelProps = PropsWithChildren & { id?: string; required?: boolean; className?: string };

export function FormLabel({ required, children, id, className }: FormLabelProps) {
	return (
		<label htmlFor={id} className={classNames('text-xs font-light capitalize', className)}>
			{children}
			{required && <span className="ml-1 text-red-500">*</span>}
		</label>
	);
}
