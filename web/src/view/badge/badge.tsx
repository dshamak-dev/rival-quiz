import classNames from 'classnames';
import { Children, cloneElement, ReactElement, ReactNode } from 'react';

import styles from './badge.module.css';

export type BadgeProps = {
	visible?: boolean;
	children: ReactElement;
	transform?: string;
	color?: string;
};

export function Badge({ visible = true, color, transform, children }: BadgeProps) {
	return Children.map(children, (child) => {
		const className = classNames(visible ? styles.container : null, child?.props.className);

		return (
			<div
				className={className}
				style={{
					'--transform': transform,
					'--color': color || undefined,
				} as any}
			>
				{cloneElement(child, { className: '' })}
			</div>
		);
	});
}
