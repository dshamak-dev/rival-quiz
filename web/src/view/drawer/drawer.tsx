import classNames from 'classnames';
import { useDrawer } from './drawer.provider';
import { ReactNode, useEffect, useRef, useState } from 'react';

import styles from './drawer.module.css';
import { useUI } from '@control/ui.control';
import { DeviceType } from '@model/ui.model';
import { Icon } from '@view/icon';

type DrawerProps = {
	open?: boolean;
	children: ReactNode;
	onClose?: () => void;
	offsetTop?: number;
	offsetBottom?: number;
};

export function Drawer({ open = false, offsetTop = 0, offsetBottom = 0, onClose, children }: DrawerProps) {
	const { deviceType } = useUI();
	const { addDrawer, removeDrawer } = useDrawer();
	const ref = useRef<HTMLDivElement>(null);

	const isMobile = deviceType === DeviceType.Mobile;

	useEffect(() => {
		if (!ref.current) {
			return;
		}

		addDrawer(ref.current);

		return () => {
			if (!ref.current) {
				return;
			}

			removeDrawer(ref.current);
		};
	}, [ref.current]);

	return (
		<div
			ref={ref}
			className={classNames(
				styles.container,
				'fixed left-0',
				'w-full h-screen overflow-hidden',
				'bg-black/60 backdrop-blur-sm',
				{
					[styles.visible]: open,
				}
			)}
			style={{
				top: `${offsetTop}px`,
				bottom: `${offsetBottom}px`,
				height: `calc(100vh - ${offsetTop}px - ${offsetBottom}px)`,
			}}
			onClick={onClose}
		>
			<div
				onClick={(e) => {
					e.stopPropagation();
				}}
				className={classNames(
					styles.container,
					'absolute right-0 top-0',
					'h-full overflow-hidden',
					'bg-white',
					// 'grid grid-rows-[auto_1fr]',
					isMobile ? 'w-[90vw]' : 'min-w-[200px] max-w-full',
					{
						[styles.visible]: open,
					}
				)}
			>
				{/* <div className="flex justify-end">
					<div onClick={onClose} className="p-4"><Icon name="X" size={32} /></div>
				</div> */}
				{children}
			</div>
		</div>
	);
}
