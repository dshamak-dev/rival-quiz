import { Icon } from '@view/icon';
import classNames from 'classnames';
import { ButtonHTMLAttributes, PropsWithChildren, useMemo } from 'react';

export type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<any>> & {
	layout?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'text';
	size?: ButtonSizeType;
	loading?: boolean;
	faded?: boolean;
};

export type ButtonSizeType = 'base' | 'small' | 'large';

export function Button({ className, layout, size = 'small', loading, children, faded = true, ...props }: ButtonProps) {
	const layoutClassName = useMemo(() => {
		switch (layout) {
			case 'primary':
				return 'bg-black text-white';
			case 'secondary':
				return 'border border-black/20 bg-sky-300 text-black';
			case 'tertiary':
				return 'border border-black/20 bg-amber-300 text-black';
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

	if (layout === 'text') {
		return <div {...props}>{children}</div>;
	}

	return (
		<button
			{...props}
			className={classNames(
				'flex gap-2 items-center justify-center shadow-md uppercase',
				layoutClassName,
				sizeClassName,
				{
					'opacity-50': props.disabled,
					'opacity-80 hover:shadow-sm hover:opacity-100': !props.disabled && faded,
				},
				className
			)}
		>
			{loading ? (
				<Icon
					name="ArrowClockwise"
					size={18}
					className={classNames({
						'animate-spin': loading,
					})}
				/>
			) : null}
			{children}
		</button>
	);
}
