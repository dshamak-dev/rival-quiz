import { Button } from '@view/button/button';
import { useEffect, useRef, useState } from 'react';

import { PaymentElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { InvoiceDTO } from 'src/invoice/type';

import styles from '../payment.module.css';
import { toCurrency } from '../../helper';
import { PAYMENT_METHOD } from 'src/payment/constant';
import { fetchPaymentDetails } from 'src/payment/api';
import { StripePaymentDTO } from 'src/payment/type';

type Props = {
	invoice: InvoiceDTO;
	children?: React.ReactNode;
	onReady?: () => void;
	onChange?: (payload: any, valid: boolean) => void;
};

export default function StripePayment({ invoice, onReady, onChange }: Props) {
	const [paymentDetails, setPaymentDetails] = useState<any>(null);
	const stripePromiseRef = useRef<any>(null);

	const loadPaymentIntent = async () => {
		const paymentDetails = await fetchPaymentDetails<StripePaymentDTO>(invoice, PAYMENT_METHOD.STRIPE);

		setPaymentDetails(paymentDetails);

		if (!paymentDetails.publicKey) {
			console.error('Failed to create payment intent:', paymentDetails);
			return;
		}
		const stripe = await loadStripe(paymentDetails.publicKey);

		stripePromiseRef.current = stripe;

		onReady?.();
		// console.log('Payment Details:', paymentDetails);
		// stripe?.redirectToCheckout({ sessionId: paymentDetails.intent.id });
	};

	useEffect(() => {
		loadPaymentIntent();
	}, []);

	if (!paymentDetails) {
		return <p className="text-center">Loading Stripe...</p>;
	}

	// const handleClick = async () => {
	// 	const paymentIntent: PaymentIntent = await WEB_API.post('/payment?type=stripe', {
	// 		remix: true,
	// 		body: JSON.stringify(invoice),
	// 		headers: { 'Content-Type': 'application/json' },
	// 	});

	// 	const stripe = await loadStripe(publicKey).then((it) => it);
	// 	console.log('Payment intent:', paymentIntent);
	// 	stripe?.redirectToCheckout({ sessionId: paymentIntent.id });
	// };

	if (!paymentDetails.publicKey) {
		return <p>Error: Failed to retrieve payment intent.</p>;
	}

	return (
		<>
			<Elements
				stripe={stripePromiseRef.current}
				options={{ clientSecret: paymentDetails.intent?.client_secret }}
			>
				<Form onSubmit={() => {}} onChange={onChange} invoice={invoice} />
			</Elements>
			{/* <Button onClick={handleClick}>{children || 'Pay with Stripe'}</Button> */}
		</>
	);
}

type FormProps = Props & { onSubmit: (payload: any, valid: boolean) => void };
function Form({ onSubmit, onChange, invoice }: FormProps) {
	const elements = useElements();
	const stripe = useStripe();
	const [updatedAt, setUpdateState] = useState(0);
	const formRef = useRef({
		errorMessage: '',
		successMessage: '',
		processing: false,
		valid: false,
		ready: false,
	});
	const state = formRef.current ? { ...formRef.current } : null;

	const handleChange = (event: StripePaymentElementChangeEvent) => {
		const { complete, empty, value } = event;
		const valid = !empty && complete;

		formRef.current = { ...formRef.current, valid, ...value };

		setUpdateState(Date.now());

		onChange?.(value, valid);
	};

	const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!stripe || !elements) {
			return;
		}

		const current = window.location.href;
		const { origin, pathname } = new URL(current);

		await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${origin}/payment-result?invoice_id=${invoice.id}&continue=${current}`,
			},
		});
	};

	return (
		<form onSubmit={handleSubmitForm} className={styles.form}>
			<div>
				<PaymentElement onChange={handleChange} />
			</div>
			<div className="flex justify-end">
				<Button type="submit" layout="primary" disabled={!state?.valid || state?.processing} className="w-full">
					{state?.processing
						? 'Processing...'
						: `Pay ${toCurrency(invoice.total, 1, invoice.currency || '$')}`}
				</Button>
			</div>
		</form>
	);
}
