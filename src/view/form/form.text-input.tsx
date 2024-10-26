import classNames from 'classnames';
import { useMemo } from 'react';
import { FormLabel } from './form.label';

export type TextInputProps = {
	label?: string;
	type: 'text' | 'email' | 'password';
	required?: boolean;
	value?: string;
	id?: string;
	placeholder?: string;
	className?: string;
	defaultValue?: string;
};

export function TextInput({ type, ...props }: TextInputProps) {
	const id = useMemo(() => {
		return props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
	}, [props.id]);

	const inputProps = useMemo(() => {
		return {
			...props,
			type,
			required: props.required,
			id,
			name: id,
			value: props.value || undefined,
			className: classNames(props.className, 'rounded border border-gray-300 px-4 py-2'),
			placeholder: props.placeholder || undefined,
		};
	}, [props, id]);

	return (
		<div className="grid w-full">
			{props.label && (
				<FormLabel required={props.required} id={props.id}>
					{props.label}
				</FormLabel>
			)}
			<input {...inputProps} />
		</div>
	);
}
