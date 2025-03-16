import { ActionFunctionArgs, json } from '@remix-run/node';
import { InvoiceDTO } from 'src/invoice/type';
import Stripe from 'stripe';

export const action = async ({ request }: ActionFunctionArgs) => {
	const { search } = new URL(request.url);
	const searchParams = new URLSearchParams(search);

	const paymentMethod = searchParams.get('type') as string;

	if (!paymentMethod) {
		throw new Error('Missing payment method header');
	}

	const invoice: InvoiceDTO = (await request.json()) as InvoiceDTO;

	if (!invoice) {
		throw new Error('Missing invoice body');
	}

	switch (paymentMethod) {
		case 'stripe': {
			const secretKey = process.env.STRIPE_SECRET_KEY;
			const publicKey = process.env.STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLISHABLE_KEY;

			if (!secretKey) {
				throw new Error('Missing Stripe secret key');
			}

			const price = invoice.total; // dollars
			const amount = Math.round(price * 100); // cents

			const stripe = new Stripe(secretKey);

			const intent = await stripe.paymentIntents
				.create({
					amount: amount,
					currency: invoice.currency || 'usd',
					automatic_payment_methods: {
						enabled: true,
					},
				})
				.catch((err) => {
					console.error('Error creating payment intent:', err);
					return null;
				});

			if (intent != null) {
				return json({ intent, publicKey, secretKey }, { status: 200 });
			}

			return json({ error: { message: 'Failed to create payment intent' }, status: 500 });
		}
		default:
			throw new Error('Unsupported payment method');
	}
};
