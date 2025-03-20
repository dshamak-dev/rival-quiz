import { ActionFunctionArgs, json } from '@remix-run/node';
import { InvoiceDTO } from 'src/invoice/type';
import { createStripePaymentIntent } from 'src/payment/api/payment.stripe-api';
import { createTONPaymentDetails, validateTONPayment } from 'src/payment/api/payment.ton-api';
import { PAYMENT_METHOD } from 'src/payment/constant';

export const action = async ({ request }: ActionFunctionArgs) => {
	const { search } = new URL(request.url);
	const searchParams = new URLSearchParams(search);

	const actionType = searchParams.get('type') as string;

	if (!actionType) {
		throw new Error('Missing payment method header');
	}

	const invoice: InvoiceDTO = (await request.json()) as InvoiceDTO;

	if (!invoice) {
		throw new Error('Missing invoice body');
	}

	if (actionType === 'validate') {
		return validateTONPayment(invoice);
	}

	switch (actionType) {
		case PAYMENT_METHOD.STRIPE: {
			const payload: any = await createStripePaymentIntent(invoice).catch((err) => {
				return { error: err?.message || 'Failed to create payment intent' };
			});
			const ok = payload.intent && !payload?.error;

			return json(payload, { status: ok ? 200 : 500 });
		}
		case PAYMENT_METHOD.TELEGRAM: {
			const payload: any = await createTONPaymentDetails(invoice).catch((err) => {
				return { error: err?.message || 'Failed to resolve TON payment' };
			});
			const ok = (payload.qr || payload.link) && !payload?.error;

			return json(payload, { status: ok ? 200 : 500 });
		}
		default:
			throw new Error('Unsupported payment method');
	}
};
