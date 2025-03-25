import { getTonPaymentIntent } from 'src/payment/api/payment.ton-api';
import { InvoiceDTO, InvoicePaymentDTO } from '../type';

export async function normalizeInvoicePaymentDTO(invoice: InvoiceDTO): Promise<InvoicePaymentDTO> {
	const intent = await getTonPaymentIntent(invoice).catch(() => {
		console.error('Failed to fetch TON payment intent');
		return null;
	});

	if (!intent) {
		return invoice;
	}

	return {
		...invoice,
		qrCode: intent.qrCode as string,
		link: intent.link,
	};
}
