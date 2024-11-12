import classNames from 'classnames';
import { useMemo } from 'react';
import { FormLabel } from './form.label';

export type SelectProps = {
	label?: string;
	required?: boolean;
	value?: string;
	id?: string;
	placeholder?: string;
	className?: string;
	defaultValue?: string | number;
	options: Array<SelectOption>;
	disabled?: boolean;
};

export type SelectOption = { value: string | number; label: string };

export function Select({ label, options, ...props }: SelectProps) {
	const id = useMemo(() => {
		return props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
	}, [props.id]);

	const inputProps = useMemo(() => {
		return {
			...props,
			required: props.required,
			id,
			name: id,
			value: props.value || undefined,
			className: classNames(props.className, 'rounded border border-gray-300 px-1 py-1 text-xs', {
				'bg-gray-100 text-gray-400': props.disabled
			}),
			placeholder: props.placeholder || undefined,
		};
	}, [props, id]);

	return (
		<div className="grid w-full">
			{label && (
				<FormLabel required={props.required} id={props.id}>
					{label}
				</FormLabel>
			)}
			<select {...inputProps}>
				{options.map(({ value, label }) => {
					return (
						<option key={String(value)} value={value}>
							{label}
						</option>
					);
				})}
			</select>
		</div>
	);
}
