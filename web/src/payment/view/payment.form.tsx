import { useMemo, useRef, useState } from 'react';
import { InvoiceDTO } from 'src/invoice/type';
import { PAYMENT_METHOD } from '../constant';
import { Typography } from '@view/typography/typography';
import StripePayment from './payment.card-form';
import { Button } from '@view/button/button';
import { toCurrency } from '../helper';

type Props = {
	invoice: InvoiceDTO;
	onSubmit: () => Promise<void>;
};
export function PaymentForm({ invoice }: Props) {
	const [updatedAt, setUpdateState] = useState(0);
	const formRef = useRef({
		paymentMethod: PAYMENT_METHOD.CARD,
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
			case PAYMENT_METHOD.CARD:
				return (
					<StripePayment
						invoice={invoice}
						onReady={handlePaymentMethodReady}
						onChange={handlePaymentChange}
					/>
				);
			// case PAYMENT_METHOD.TELEGRAM:
			// 	return <TelegramForm />;
			default:
				return (
					<Typography>
						Payment method not supported at the moment. Please try another method. Please contact support
						for further assistance.
					</Typography>
				);
		}
	}, [state?.paymentMethod]);

	return <div>{paymentMethodForm}</div>;
}
