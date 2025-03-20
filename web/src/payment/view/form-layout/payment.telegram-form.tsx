import styles from '../payment.module.css';
import { toCurrency } from '../../helper';
import { InvoiceDTO } from 'src/invoice/type';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Typography } from '@view/typography/typography';
import { PAYMENT_METHOD } from 'src/payment/constant';
import { TelegramPaymentDTO } from 'src/payment/type';
import { fetchPaymentDetails } from 'src/payment/api';

type Props = {
	invoice: InvoiceDTO;
	children?: React.ReactNode;
	onReady?: () => void;
	onChange?: (payload: any, valid: boolean) => void;
};

export default function TelegramPaymentForm({ invoice, onReady, onChange }: Props) {
	const [intent, setIntent] = useState(null);
	const stateRef = useRef({
		errorMessage: '',
		successMessage: '',
		processing: true,
		valid: false,
		ready: false,
		qr: null,
		link: null,
	});
	const [updatedAt, setUpdateState] = useState(0);
	const state = useMemo(() => ({ ...stateRef.current }), [updatedAt]);

	const handleStateChange = (payload: any, valid: boolean) => {
		stateRef.current = { ...stateRef.current, valid, ...payload };
		onChange?.(payload, valid);
		setUpdateState(Date.now());
	};

	const loadPaymentDetails = async () => {
		const paymentDetails = await fetchPaymentDetails<TelegramPaymentDTO>(invoice, PAYMENT_METHOD.TELEGRAM).catch(
			(err) => {
				return { error: err?.message || 'Failed to resolve Telegram payment', qr: null, link: null };
			}
		);

		if (paymentDetails?.qr || paymentDetails?.link) {
			handleStateChange(
				{
					...paymentDetails,
					ready: true,
					processing: false,
				},
				true
			);
		} else {
			handleStateChange(
				{
					errorMessage: paymentDetails.error || 'Failed to fetch payment details',
					ready: true,
					processing: false,
				},
				false
			);
		}
	};

	useEffect(() => {
		loadPaymentDetails();
	}, [onReady]);

	if (!state.ready || state.processing) {
		return <Typography className="text-center">Loading payment details...</Typography>;
	}

	if (state.errorMessage || (!state.qr && !state.link)) {
		return (
			<Typography className="text-center text-red-500">
				{state.errorMessage || 'Failed to fetch payment details'}
			</Typography>
		);
	}

	return (
		<div className={styles.paymentForm}>
			<div className="flex flex-col justify-center gap-2">
				<Typography className="text-red-500">Click 'VALIDATE' on invoice to force validation</Typography>
				{state.qr && (
					<div className="mx-auto">
						<p className="text-center">Scan with Tonkeeper:</p>
						<img src={state.qr} alt="Tonkeeper QR" className="w-48 h-48 ml-auto mr-auto" />
					</div>
				)}
				{state.link && (
					<a
						href={state.link}
						target="_blank"
						rel="noopener noreferrer"
						className="underline text-center font-bold"
					>
						Open Tonkeeper with Link
					</a>
				)}
			</div>
		</div>
	);
}
