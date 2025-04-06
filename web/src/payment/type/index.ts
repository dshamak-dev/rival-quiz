import { PaymentIntent } from '@stripe/stripe-js';

export type StripePaymentDTO = { intent: PaymentIntent; publicKey: string };

export type TelegramPaymentDTO = {
	qrCode: string;
	link: string;
	payload: any;
	error?: string;
};
