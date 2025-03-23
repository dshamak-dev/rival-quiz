import { useMemo, useRef, useState } from 'react';
import { InvoiceDTO } from 'src/invoice/type';
import { PAYMENT_METHOD } from '../constant';
import { Typography } from '@view/typography/typography';
import StripePayment from './form-layout/payment.card-form';
import TelegramPaymentForm from './form-layout/payment.telegram-form';
import { Button } from '@view/button/button';

import styles from './payment.module.css';

type Props = {
	invoice: InvoiceDTO;
	onSubmit: () => Promise<void>;
};
export function PaymentForm({ invoice }: Props) {
	const [updatedAt, setUpdateState] = useState(0);
	const formRef = useRef({
		paymentMethod: '',
		errorMessage: '',
		successMessage: '',
		processing: false,
		valid: false,
		ready: false,
	});
	const state = formRef.current ? { ...formRef.current } : null;

	const handleChange = (payload: Record<string, any>) => {
		formRef.current = { ...formRef.current, ...payload };
		setUpdateState(Date.now());
	};

	const handlePaymentMethodReady = () => {
		handleChange({ ready: true });
	};

	const handlePaymentChange = (payload: any, valid: boolean) => {
		handleChange({ valid });
	};

	const paymentMethodForm = useMemo(() => {
		// Add payment method specific form components
		switch (state?.paymentMethod) {
			case '': {
				return <Typography className="text-center">Select a payment method</Typography>;
			}
			case PAYMENT_METHOD.STRIPE:
				return (
					<StripePayment
						invoice={invoice}
						onReady={handlePaymentMethodReady}
						onChange={handlePaymentChange}
					/>
				);
			case PAYMENT_METHOD.TELEGRAM:
				return (
					<TelegramPaymentForm
						invoice={invoice}
						onReady={handlePaymentMethodReady}
						onChange={handlePaymentChange}
					/>
				);
			default:
				return (
					<Typography>
						Payment method not supported at the moment. Please try another method. Please contact support
						for further assistance.
					</Typography>
				);
		}
	}, [state?.paymentMethod]);

	const paymentMethodOptions = useMemo(() => {
		return [
			{
				type: PAYMENT_METHOD.STRIPE,
				label: 'Credit Card',
			},
			{
				type: PAYMENT_METHOD.TELEGRAM,
				label: 'Telegram (TON)',
			},
		].map(({ type, label }) => {
			return (
				<Button key={type} onClick={() => handleChange({ paymentMethod: type })}>
					{label}
				</Button>
			);
		});
	}, []);

	return (
		<div className={styles.container}>
			<div className={styles.paymentList}>{paymentMethodOptions}</div>
			<div>{paymentMethodForm}</div>
		</div>
	);
}
