import { Button, ButtonProps } from '@view/button/button';
import { ComponentProps, useState } from 'react';
import { PaymentModal } from './payment.modal';
import { ModalProps } from '@view/modal/modal';
import { InvoiceDTO } from 'src/invoice/type';
import { requestPaymentValidation } from '../api';
import { completeInvoice } from 'src/invoice/api';
import { InvoiceStatus } from '@shared/invoice/type';
import { Icon } from '@view/icon';

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
			<Button children={children || 'Pay'} {...buttonProps} onClick={handleClick} layout="primary" />
			<PaymentModal invoice={invoice} open={isOpen} onClose={handleClose} />
		</>
	);
}

export function PaymentValidateButton({ invoice, disabled = false }: { invoice: InvoiceDTO; disabled?: boolean }) {
	const [isLoading, setIsLoading] = useState(false);

	const handleValidateInvoice = async () => {
		setIsLoading(true);
		const invoiceTransaction: any = await requestPaymentValidation(invoice).catch((err) => {
			console.error('Failed to validate invoice:', err);
			return null;
		});

		if (invoiceTransaction != null && invoiceTransaction.ok) {
			const updatedInvoice = await completeInvoice(
				invoice.id,
				{
					status: InvoiceStatus.PAID,
					metadata: {
						payment: {
							...invoiceTransaction,
						},
					},
				},
				{}
			)
				.catch((err) => {
					console.error('Failed to update invoice:', err);
					return null;
				})
				.finally(() => {
					setIsLoading(false);
				});

			if (updatedInvoice && updatedInvoice.status === InvoiceStatus.PAID) {
				console.log('Invoice has been paid successfully');
				window.location.reload();
			} else {
				console.error('Failed to update invoice status to PAID');
			}
		} else {
			setIsLoading(false);
		}
	};

	const handleClick = async () => {
		handleValidateInvoice();
	};

	return (
		<Button onClick={handleClick} loading={isLoading} disabled={disabled}>
			{!isLoading && <Icon name="ArrowClockwise" />}
		</Button>
	);
}
