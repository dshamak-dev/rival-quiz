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
	children?: React.ReactNode | ((isOpen: boolean, dispatch: DispatchType) => React.ReactNode);
	okButtonProps?: ButtonProps | null;
	cancelButtonProps?: ButtonProps | null;
	zIndex?: number;
};

export type DispatchType = (action: ActionType) => void;
export type ActionType = { type: 'open' | 'close'; payload: boolean } | { type: 'loading'; payload: boolean };

export function Modal(props: ModalProps) {
	const { open, title, children, onClose, onOpen, beforeOpen, beforeClose } = props;
	const [isOpen, setIsOpen] = useState(open || false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsOpen(open || false);
	}, [open]);

	useEffect(() => {
		if (isOpen) {
			onOpen?.();
		} else {
			onClose?.();
			setIsLoading(false);
		}
	}, [isOpen]);

	const handleVisibilityChange = async (type: 'open' | 'close' | 'cancel') => {
		if (type === 'cancel') {
			setIsOpen(false);
			setIsLoading(false);
			return;
		}

		const checkHandler = type === 'open' ? beforeOpen : beforeClose;

		if (checkHandler) {
			setIsLoading(true);
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

		setIsLoading(false);
	};

	const dispatch = (action: ActionType) => {
		switch (action.type) {
			case 'open':
				handleVisibilityChange('open');
				break;
			case 'close':
				handleVisibilityChange('close');
				break;
			case 'loading':
				setIsLoading(action.payload);
				break;
		}
	};

	if (!isOpen) {
		return null;
	}

	const render = (content: React.ReactNode) => {
		return (
			<div className={styles.overlay}>
				<div className={styles.container}>
					<div className={styles.close} onClick={() => handleVisibilityChange('cancel')}>
						<Icon name="X" size={32} />
					</div>
					<div className={styles.header}>
						{title != null && (
							<Typography className="text-xl text-center" size="custom">
								{title}
							</Typography>
						)}
					</div>
					<div className={styles.content}>{content}</div>
					<div className={styles.footer}>
						{props.cancelButtonProps !== null && (
							<Button
								{...props.cancelButtonProps}
								size="small"
								onClick={() => handleVisibilityChange('cancel')}
								disabled={isLoading}
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
								onClick={() => handleVisibilityChange('close')}
								disabled={props.okButtonProps?.disabled || isLoading}
								loading={isLoading}
							>
								OK
							</Button>
						)}
					</div>
				</div>
			</div>
		);
	};

	if (children instanceof Function) {
		const content = children(isOpen, dispatch);

		return render(content);
	}

	return render(children);
}
