import classNames from 'classnames';
import { PropsWithChildren, createElement, useMemo } from 'react';

type TypographyType = 'h1' | 'h2' | 'h3' | 'paragraph';

type TypographySize = 'small' | 'medium' | 'large' | 'huge' | 'custom';

interface IProps extends PropsWithChildren<any> {
	type?: TypographyType;
	size?: TypographySize;
}

export function Typography(props: IProps) {
	const sizeClassName = useMemo(() => {
		return props.size ? getSizeClassName(props.size) : null;
	}, [props.size]);

	const { tag, className } = useMemo(() => {
		switch (props.type) {
			case 'h1': {
				return { tag: 'h1', className: classNames('font-bold', sizeClassName || "text-2xl") };
			}
			case 'h2': {
				return {
					tag: 'h2',
					className: classNames('font-semibold', sizeClassName || getSizeClassName('large')),
				};
			}
			case 'h3': {
				return { tag: 'h3', className: sizeClassName || getSizeClassName('large') };
			}
			case 'paragraph': {
				return { tag: 'p', className: sizeClassName || 'text-base' };
			}
			default: {
				return { tag: 'div', className: sizeClassName || 'text-base' };
			}
		}
	}, [props.type, sizeClassName]);

	return createElement(tag, {
		...props,
		className: classNames(className, props.className, sizeClassName),
	});
}

function getSizeClassName(size: TypographySize) {
	switch (size) {
		case 'small':
			return 'text-sm';
		case 'medium':
			return 'text-base';
		case 'large':
			return 'text-2xl';
		case 'huge':
			return 'text-4xl';
		default:
			return null;
	}
}
