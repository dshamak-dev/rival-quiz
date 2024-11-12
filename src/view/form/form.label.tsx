import { Typography } from '@view/typography/typography';
import { PropsWithChildren } from 'react';

export type FormLabelProps = PropsWithChildren & { id?: string; required?: boolean };

export function FormLabel({ required, children, id }: FormLabelProps) {
	return (
		<label htmlFor={id}>
			<Typography className='text-xs font-light capitalize flex gap-1'>
				{children}
				{required && <span className='text-red-500'>*</span>}
			</Typography>
		</label>
	);
}
