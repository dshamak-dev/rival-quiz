import classNames from 'classnames';
import { ButtonHTMLAttributes, PropsWithChildren, useMemo } from 'react';

export type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<any>> & {
	layout?: 'primary' | 'secondary' | 'tertiary';
	size?: ButtonSizeType;
};

export type ButtonSizeType = 'base' | 'small' | 'large';

export function Button({ className, layout, size = 'base', ...props }: ButtonProps) {
	const layoutClassName = useMemo(() => {
		switch (layout) {
			case 'primary':
				return 'bg-black text-white';
			case 'secondary':
				return 'bg-sky-300 text-black';
			case 'tertiary':
				return 'bg-amber-300 text-black';
			default:
				return 'border border-black bg-white text-black';
		}
	}, [layout]);

	const sizeClassName = useMemo(() => {
		switch (size) {
			case 'small':
				return 'text-xs text-xl py-2 px-4';
			case 'large':
				return 'text-lg text-xl py-2 px-4';
			default:
				return 'text-base py-2 px-4';
		}
	}, [size]);

	return (
		<button
			{...props}
			className={classNames(
				'shadow-md uppercase',
				layoutClassName,
				sizeClassName,
				{
					'opacity-50': props.disabled,
					'opacity-80 hover:shadow-sm hover:opacity-100': !props.disabled,
				},
				className
			)}
		/>
	);
}
