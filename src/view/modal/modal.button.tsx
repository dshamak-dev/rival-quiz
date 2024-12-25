import { Button, ButtonProps } from '@view/button/button';
import { Modal, ModalProps } from './modal';
import { useState } from 'react';

export type ModalButtonProps = ModalProps & {
	buttonProps: ButtonProps;
};

export function ModalButton({ buttonProps, ...modalProps }: ModalButtonProps) {
	const [isOpen, setIsOpen] = useState(modalProps.open || false);

	const handleClick = () => {
		setIsOpen(true);
	};

	const handleClose = () => {
		setIsOpen(false);
	};

	return (
		<>
			<Button {...buttonProps} onClick={handleClick} />
			<Modal open={isOpen} onClose={handleClose} {...modalProps} />
		</>
	);
}
