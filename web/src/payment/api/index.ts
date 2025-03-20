import { InvoiceDTO } from 'src/invoice/type';
import { PAYMENT_METHOD } from '../constant';
import { WEB_API } from '@control/api.control';

export async function fetchPaymentDetails<T>(invoice: InvoiceDTO, paymentMethod: PAYMENT_METHOD): Promise<T> {
	return WEB_API.post(`/payment?type=${paymentMethod}`, {
		remix: true,
		body: JSON.stringify(invoice),
		headers: { 'Content-Type': 'application/json' },
	});
}

export async function requestPaymentValidation<T>(invoice: InvoiceDTO): Promise<T> {
	return WEB_API.post(`/payment?type=validate`, {
		remix: true,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(invoice),
	});
}
