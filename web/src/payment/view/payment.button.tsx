import { Button, ButtonProps } from '@view/button/button';
import { ComponentProps, useState } from 'react';
import { PaymentModal } from './payment.modal';
import { ModalProps } from '@view/modal/modal';

type Props = {
	children?: React.ReactNode;
	buttonProps?: ButtonProps;
	modalProps?: ModalProps;
	invoice: ComponentProps<typeof PaymentModal>['invoice'];
};
export function PaymentButton({ invoice, children, buttonProps, modalProps }: Props) {
	const [isOpen, setIsOpen] = useState(modalProps?.open || false);

	const handleClick = () => {
		setIsOpen(true);
	};

	const handleClose = () => {
		setIsOpen(false);
	};

	return (
		<>
			<Button children={children || 'Pay'} {...buttonProps} onClick={handleClick} layout="primary"  />
			<PaymentModal invoice={invoice} open={isOpen} onClose={handleClose} />
		</>
	);
}
