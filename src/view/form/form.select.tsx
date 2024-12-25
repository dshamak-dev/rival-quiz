import classNames from 'classnames';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
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

export type SelectOption = { value: string | number; label: string | JSX.Element; disabled?: boolean };

export function Select({ label, options, className, ...props }: SelectProps) {
	const [selectedAnswer, setSelectedAnswer] = useState<string | number | undefined>(
		(props.value ?? props.defaultValue) || ''
	);
	const id = useMemo(() => {
		return props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
	}, [props.id]);

	const inputClassName = useMemo(() => {
		return classNames(className, 'rounded border border-gray-300 px-1 py-1 text-inherit', {
			'bg-gray-100 text-gray-400': props.disabled,
		});
	}, [className, props.disabled]);

	const inputProps = useMemo(() => {
		return {
			...props,
			required: props.required,
			id,
			name: id,
			value: (props.value ?? props.defaultValue) || '',
			placeholder: props.placeholder || undefined,
		};
	}, [props, id]);

	useEffect(() => {
		if (props.value != null) {
			setSelectedAnswer(props.value);
		}
	}, [props.value]);

	const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
		if (props.onChange) {
			props.onChange(e);
		}
		setSelectedAnswer(e.target.value);

		return () => {
			setSelectedAnswer(undefined);
		};
	};

	return (
		<div className="w-full">
			{label && (
				<FormLabel required={props.required} id={props.id}>
					{label}
				</FormLabel>
			)}
			<select {...inputProps} onChange={handleChange} value={selectedAnswer} className={inputClassName}>
				{options.map(({ disabled, value, label }) => {
					return (
						<option key={String(value)} value={value} disabled={disabled}>
							{label}
						</option>
					);
				})}
			</select>
		</div>
	);
}
