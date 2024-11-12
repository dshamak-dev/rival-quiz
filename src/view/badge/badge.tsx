import classNames from 'classnames';
import { Children, cloneElement, ReactElement, ReactNode } from 'react';

import styles from './badge.module.css';

export type BadgeProps = {
	children: ReactElement;
};

export function Badge({ children }: BadgeProps) {
	return Children.map(children, (child) => {
		const className = classNames(styles.container, child?.props.className);

		return <div className={className}>{cloneElement(child, { className: '' })}</div>;
	});
}
