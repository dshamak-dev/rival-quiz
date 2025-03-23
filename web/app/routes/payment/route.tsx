import { getAuthHeaders } from '@/auth';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { expandResponse } from '@shared/async/helpers';
import { InvoiceStatus } from '@shared/invoice/type';
import { completeInvoice } from 'src/invoice/api';
import { InvoiceDTO } from 'src/invoice/type';
import { createStripePaymentIntent } from 'src/payment/api/payment.stripe-api';
import { createTonPaymentIntent, validateTonPayment } from 'src/payment/api/payment.ton-api';
import { PAYMENT_METHOD } from 'src/payment/constant';

export const action = async ({ request }: ActionFunctionArgs) => {
	const { search } = new URL(request.url);
	const searchParams = new URLSearchParams(search);

	const headers = await getAuthHeaders(request).catch((err) => null);

	const actionType = searchParams.get('type') as string;

	if (!actionType) {
		throw new Error('Missing payment method header');
	}

	const body = await request.json();

	if (actionType === 'validate') {
		const transactionDetails: any = await validateTonPayment(body.transactionHash).catch((err) => {
			return { error: err?.message || 'Failed to validate TON transaction' };
		});

		// Confirm invoice if has linked invoice id
		if (transactionDetails.invoiceId) {
			const [updatedInvoice, updateError] = await expandResponse(
				completeInvoice(
					transactionDetails.invoiceId,
					{
						status: InvoiceStatus.PAID,
						metadata: {
							payment: transactionDetails,
						},
					},
					{ headers }
				)
			);

			if (!updatedInvoice || updateError) {
				return { error: updateError || 'Failed to confirm invoice' };
			}

			return json(updatedInvoice, { status: 200 });
		}

		return json(transactionDetails, { status: transactionDetails.error ? 400 : 200 });
	}

	const invoice = body as InvoiceDTO;

	if (!invoice) {
		throw new Error('Missing invoice body');
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
			const payload: any = await createTonPaymentIntent(invoice).catch((err) => {
				return { error: err?.message || 'Failed to resolve TON payment' };
			});
			const ok = (payload.qrCode || payload.link) && !payload?.error;

			return json(payload, { status: ok ? 200 : 500 });
		}
		default:
			throw new Error('Unsupported payment method');
	}
};
