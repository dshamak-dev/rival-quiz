import classNames from 'classnames';
import { ChangeEvent, useCallback, useMemo } from 'react';
import { FormLabel } from './form.label';
import { getRandomId } from '@control/random';

export type TextInputType = 'text' | 'email' | 'password';

export type TextInputSizeType = 'base' | 'small' | 'large';

export type TextInputProps = {
	label?: string | React.ReactNode;
	postfix?: string | React.ReactNode;
	type?: TextInputType;
	required?: boolean;
	value?: string;
	id?: string;
	placeholder?: string;
	className?: string;
	defaultValue?: string;
	size?: TextInputSizeType;
	disabled?: boolean;
	onChange?: (e: ChangeEvent<HTMLInputElement>, value: any) => void;
};

export function TextInput({
	type = 'text',
	size = 'base',
	defaultValue,
	className,
	onChange,
	postfix,
	...props
}: TextInputProps) {
	const id = useMemo(() => {
		return props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
	}, [props.id]);

	const sizeClassName = useMemo(() => {
		switch (size) {
			case 'small':
				return 'text-xs px-2 py-1';
			case 'large':
				return 'text-lg px-2 py-2';
			default:
				return 'text-base px-2 py-1';
		}
	}, [size]);

	const inputClassName = useMemo(() => {
		return classNames(className, sizeClassName, 'rounded border border-gray-300', {
			'opacity-50': props.disabled,
		});
	}, [sizeClassName, className, props.disabled]);

	const inputProps = useMemo(() => {
		const nextProps = {
			...props,
			defaultValue,
			type,
			required: props.required,
			id: `${id || ''}-${getRandomId()}`,
			name: id,
			value: props.value,
			placeholder: props.placeholder || undefined,
		};

		return nextProps;
	}, [props, id]);

	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			if (!onChange) {
				return;
			}

			onChange(e, e.target.value);
		},
		[onChange]
	);

	return (
		<div className="grid w-full">
			{props.label && (
				<FormLabel
					required={props.required}
					id={props.id}
					postfix={postfix}
					className="flex items-center"
				>
					{props.label}
				</FormLabel>
			)}
			<input {...inputProps} className={inputClassName} onChange={handleChange} />
		</div>
	);
}
