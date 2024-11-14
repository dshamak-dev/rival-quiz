import classNames from 'classnames';
import { ChangeEvent, useMemo } from 'react';
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
	onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
};

export type SelectOption = { value: string | number; label: string };

export function Select({ label, options, className, ...props }: SelectProps) {
	const id = useMemo(() => {
		return props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
	}, [props.id]);

	const inputClassName = useMemo(() => {
		return classNames(className, 'rounded border border-gray-300 px-1 py-1 text-xs', {
			'bg-gray-100 text-gray-400': props.disabled,
		});
	}, [className, props.disabled]);

	const inputProps = useMemo(() => {
		return {
			...props,
			required: props.required,
			id,
			name: id,
			value: props.value ?? props.defaultValue,
			placeholder: props.placeholder || undefined,
		};
	}, [props, id]);

	return (
		<div className="w-full">
			{label && (
				<FormLabel required={props.required} id={props.id}>
					{label}
				</FormLabel>
			)}
			<select {...inputProps} className={inputClassName}>
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
