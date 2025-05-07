import classNames from 'classnames';
import {
	ChangeEvent,
	FocusEvent,
	useCallback,
	useMemo,
} from 'react';
import { FormLabel } from './form.label';
import { getRandomId } from '@control/random';

export type TextInputType = 'text' | 'email' | 'password' | 'number' | 'textarea';

export type TextInputSizeType = 'base' | 'small' | 'large';

export type TextInputProps = {
	onRef?: (el: HTMLInputElement | HTMLTextAreaElement) => void;
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
	onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, value: any) => void;
	inputProps?: Record<string, any>;
	onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	layout?: 'outline' | 'error';
	style?: React.CSSProperties;
	errors?: boolean | string[];
};

export function TextInput({
	type = 'text',
	size = 'base',
	defaultValue,
	className,
	onChange,
	postfix,
	onRef,
	layout = 'outline',
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

	const layoutClassName = useMemo(() => {
		switch (layout) {
			case 'error':
				return 'border border-red-500';
			default:
				return 'border-gray-300';
		}
	}, [layout]);

	const inputClassName = useMemo(() => {
		return classNames(className, sizeClassName, layoutClassName, 'rounded border', {
			'opacity-50': props.disabled,
			'border border-red-500 text-red': props.errors
		});
	}, [sizeClassName, className, layoutClassName, props.disabled, props.errors]);

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
		(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
			{type === 'textarea' ? (
				<textarea
					ref={(el) => onRef?.(el as HTMLTextAreaElement)}
					{...inputProps}
					className={inputClassName}
					onChange={handleChange}
				/>
			) : (
				<input
					ref={(el) => onRef?.(el as HTMLInputElement)}
					{...inputProps}
					className={inputClassName}
					onChange={handleChange}
				/>
			)}
		</div>
	);
}
