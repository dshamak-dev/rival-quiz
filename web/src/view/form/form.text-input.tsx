import classNames from 'classnames';
import {
	ChangeEvent,
	ComponentProps,
	FocusEvent,
	HTMLInputTypeAttribute,
	PropsWithRef,
	useCallback,
	useMemo,
} from 'react';
import { FormLabel } from './form.label';
import { getRandomId } from '@control/random';

export type TextInputType = 'text' | 'email' | 'password' | 'number';

export type TextInputSizeType = 'base' | 'small' | 'large';

export type TextInputProps = {
	onRef?: (el: HTMLInputElement) => void;
	label?: string | React.ReactNode;
	postfix?: string | React.ReactNode;
	type?: TextInputType;
	required?: boolean;
	value?: string | number;
	id?: string;
	placeholder?: string;
	className?: string;
	defaultValue?: string | number;
	size?: TextInputSizeType;
	disabled?: boolean;
	onChange?: (e: ChangeEvent<HTMLInputElement>, value: any) => void;
	inputProps?: Record<string, any>;
	onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
	layout?: 'outline' | 'error';
};

export function TextInput({
	type = 'text',
	size = 'base',
	defaultValue,
	className,
	onChange,
	postfix,
	onRef,
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
		const { inputProps, ...other } = props;

		const isControlled = props.value !== undefined;

		const nextProps = {
			...inputProps,
			...other,
			defaultValue: isControlled ? undefined : defaultValue,
			type,
			required: props.required,
			id: `${id || ''}-${getRandomId()}`,
			name: id,
			value: isControlled ? props.value || defaultValue : props.value,
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
				<FormLabel required={props.required} id={props.id} postfix={postfix} className="flex items-center">
					{props.label}
				</FormLabel>
			)}
			<input ref={onRef} {...inputProps} className={inputClassName} onChange={handleChange} />
		</div>
	);
}
