import { Icon } from '@view/icon';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

type TitleType = string | JSX.Element;

export type CollapseProps = {
	title: TitleType | ((isOpen: boolean) => TitleType);
	initialState?: boolean;
	children: JSX.Element;
	stickyHeader?: boolean;
};

export function Collapse({ title, children, stickyHeader, initialState = false }: CollapseProps) {
	const [isOpen, setIsOpen] = useState(initialState);

	return (
		<div className="relative flex flex-col bg-white rounded overflow-hidden border">
			<div
				className={classNames(
					'w-full py-2 px-4 flex gap-4 items-center justify-between',
					'cursor-pointer bg-gray-200',
					{
						'sticky top-0': stickyHeader
					}
				)}
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="w-full">{title instanceof Function ? title(isOpen) : title}</div>
				<div>
					<Icon name={isOpen ? 'CaretUp' : 'CaretDown'} />
				</div>
			</div>
			<div className={classNames('overflow-hidden', { 'h-auto': isOpen, 'h-0': !isOpen })}>{children}</div>
		</div>
	);
}
