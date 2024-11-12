import classNames from 'classnames';
import { ChangeEvent, useCallback, useMemo } from 'react';
import { FormLabel } from './form.label';

export type TextInputType = 'text' | 'email' | 'password';

export type TextInputSizeType = 'base' | 'small' | 'large';

export type TextInputProps = {
	label?: string;
	type?: TextInputType;
	required?: boolean;
	value?: string;
	id?: string;
	placeholder?: string;
	className?: string;
	defaultValue?: string;
	size?: TextInputSizeType;
	onChange?: (e: ChangeEvent<HTMLInputElement>, value: any) => void;
};

export function TextInput({ type = 'text', size = "base", onChange, ...props }: TextInputProps) {
	const id = useMemo(() => {
		return props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
	}, [props.id]);

	const inputClassName = useMemo(() => {
		switch (size) {
            case 'small':
                return 'text-xs px-2 py-1';
            case 'large':
                return 'text-lg px-2 py-2';
            default:
                return 'text-base px-2 py-1';
        }
	}, [size])

	const inputProps = useMemo(() => {
		return {
			...props,
			type,
			required: props.required,
			id,
			name: id,
			value: props.value || '',
			className: classNames(props.className, inputClassName, 'rounded border border-gray-300'),
			placeholder: props.placeholder || undefined,
		};
	}, [props, id]);

	const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		if (!onChange) {
			return;
		}

		onChange(e, e.target.value);
	}, [onChange]);

	return (
		<div className="grid w-full">
			{props.label && (
				<FormLabel required={props.required} id={props.id}>
					{props.label}
				</FormLabel>
			)}
			<input {...inputProps} onChange={handleChange} />
		</div>
	);
}
