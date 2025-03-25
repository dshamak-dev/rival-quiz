import { Typography } from '@view/typography/typography';
import { InvoicePaymentDTO } from '../type';
import { ModalButton } from '@view/modal/modal.button';
import { Icon } from '@view/icon';
import { TextInput } from '@view/form/form.text-input';
import { useRef, useState } from 'react';

type Props = {
	invoice: InvoicePaymentDTO;
	onConfirm: (payload: any) => Promise<void>;
};

export function InvoicePaymentCard({ invoice, onConfirm }: Props) {
	const [updatedAt, setUpdateState] = useState(0);
	const formRef = useRef({
		errorMessage: '',
		transferId: '',
		valid: false,
		busy: false,
		error: null,
	});
	const state = { ...formRef.current };

	const handleFormFieldChange = (payload: Record<string, any>) => {
		formRef.current = { ...formRef.current, ...payload };
		formRef.current.errorMessage = '';
		formRef.current.valid = !!formRef.current.transferId?.trim();

		setUpdateState(Date.now());
	};

	const handleConfirm = async () => {
		return onConfirm({ transferId: state.transferId });
	};

	return (
		<div className="flex flex-col gap-2 items-center border p-2">
			<Typography variant="h6">Invoice #{invoice.id}</Typography>
			{invoice.metadata?.paymentDetails && (
				<Typography variant="body1">{invoice.metadata.paymentDetails.details}</Typography>
			)}
			{invoice.link && (
				<a
					href={invoice.link}
					target="_blank"
					rel="noopener noreferrer"
					className="underline text-center font-bold"
				>
					Open Tonkeeper with Link
				</a>
			)}
			{invoice.qrCode && (
				<ModalButton
					okButtonProps={{
						children: <Typography>Confirm</Typography>,
						disabled: state.busy || !state.valid,
					}}
					buttonProps={{
						layout: 'primary',
						children: (
							<Typography className="flex gap-2 items-center">
								Confirm Transfer <Icon name="QrCode" size={16} />
							</Typography>
						),
					}}
					beforeClose={handleConfirm}
				>
					<div className="flex flex-col gap-4 items-center mx-auto">
						<div className="flex flex-col gap-2 items-center">
							<p className="text-center">Scan with Tonkeeper:</p>
							<img src={invoice.qrCode} alt="Tonkeeper QR" className="w-48 h-48 ml-auto mr-auto" />
						</div>
						<div className="flex flex-col gap-2 items-center">
							<TextInput
								label="Transfer ID"
								placeholder="Set Confirmation Transfer Id"
								onChange={(e) => handleFormFieldChange({ transferId: e.target.value })}
							/>
							{/* <Button layout="primary" size="small" className="w-full">
								Confirm
							</Button> */}
						</div>
					</div>
				</ModalButton>
			)}
		</div>
	);
}
