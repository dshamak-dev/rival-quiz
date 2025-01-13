import { ProgressHTMLAttributes, ReactNode } from 'react';
import styles from './progress.module.css';
import classNames from 'classnames';

export type ProgressProps = Omit<ProgressHTMLAttributes<any>, 'prefix'> & {
	prefix?: ReactNode;
	postfix?: ReactNode;
};

export function Progress({ value, max, prefix, postfix, className, ...other }: ProgressProps) {
	return (
		<div className="flex flex-col">
			{(prefix || postfix) && (
				<div className="w-full flex justify-between items-end gap-6">
					<div>{prefix}</div>
					<div>{postfix}</div>
				</div>
			)}
			<progress
				{...other}
				className={classNames(styles.container, className)}
				value={value || 0}
				max={max ?? 100}
			></progress>
		</div>
	);
}
