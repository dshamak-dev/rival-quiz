import Stripe from 'stripe';
import { InvoiceDTO } from 'src/invoice/type';

export async function createStripePaymentIntent(invoice: InvoiceDTO) {
	const secretKey = process.env.STRIPE_SECRET_KEY;
	const publicKey = process.env.STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLISHABLE_KEY;

	if (!secretKey) {
		throw new Error('Missing Stripe secret key');
	}

	const price = invoice.cost; // dollars
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

	return { intent, publicKey, secretKey };
}
