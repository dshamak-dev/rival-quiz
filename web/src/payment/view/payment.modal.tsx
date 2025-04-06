import { Modal, ModalProps } from '@view/modal/modal';
import { PaymentForm } from './payment.form';
import { InvoiceDTO } from 'src/invoice/type';
import { ClientOnly } from '@view/client/remix.client-only';

type Props = {
	onClose: () => void;
	open: boolean;
	onSubmit?: (data: { [key: string]: any }) => void;
	modalProps?: ModalProps;
	invoice: InvoiceDTO;
};

export function PaymentModal({ invoice, onClose, open, onSubmit, modalProps }: Props) {
	const handleSubmit = async () => {};

	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Payment Details"
			hideFooter
			{...modalProps}
		>
			<ClientOnly fallback={<p>Loading Stripe...</p>}>
				{() => <PaymentForm invoice={invoice} onSubmit={handleSubmit} />}
			</ClientOnly>
		</Modal>
	);
}
