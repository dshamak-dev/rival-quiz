import { Button, ButtonProps } from '@view/button/button';
import { useEffect, useState } from 'react';
import styles from './modal.module.css';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';

export type ModalProps = {
	open?: boolean;
	beforeOpen?: () => Promise<void>;
	onOpen?: () => void;
	beforeClose?: () => Promise<void>;
	onClose?: () => void;
	title?: React.ReactNode;
	children?: React.ReactNode;
	okButtonProps?: ButtonProps | null;
	cancelButtonProps?: ButtonProps | null;
	zIndex?: number;
};

export function Modal(props: ModalProps) {
	const { open, title, onClose, onOpen, beforeOpen, beforeClose } = props;
	const [isOpen, setIsOpen] = useState(open || false);

	useEffect(() => {
		setIsOpen(open || false);
	}, [open]);

	useEffect(() => {
		if (isOpen) {
			onOpen?.();
		} else {
			onClose?.();
		}
	}, [isOpen]);

	const handleVisibilityChange = async (type: 'open' | 'close') => {
		const checkHandler = type === 'open' ? beforeOpen : beforeClose;

		if (checkHandler) {
			await checkHandler()
				.then(() => {
					setIsOpen(false);
				})
				.catch(() => {
					return null;
				});
		} else {
			setIsOpen(false);
		}
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className={styles.overlay}>
			<div className={styles.container}>
				<div className={styles.close} onClick={() => handleVisibilityChange('close')}>
					<Icon name="X" size={32} />
				</div>
				<div className={styles.header}>
					{title != null && (
						<Typography className="text-xl text-center" size="custom">
							{title}
						</Typography>
					)}
				</div>
				<div className={styles.content}>{props.children}</div>
				<div className={styles.footer}>
					{props.cancelButtonProps !== null && (
						<Button
							{...props.cancelButtonProps}
							size="small"
							onClick={() => handleVisibilityChange('close')}
						>
							Cancel
						</Button>
					)}
					{props.okButtonProps !== null && (
						<Button
							{...props.okButtonProps}
							layout="primary"
							size="small"
							className="min-w-[80px]"
							onClick={() => handleVisibilityChange('open')}
						>
							OK
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
