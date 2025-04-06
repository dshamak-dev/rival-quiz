import { WEB_API } from '@control/api.control';
import { InvoiceDTO, InvoiceStatus } from '@shared/invoice/type';
import { CurrencyTypeEnum } from '@shared/payment/constant';
import { useAuth } from '@state/auth.hook';
import { Button } from '@view/button/button';
import { TextInput } from '@view/form/form.text-input';
import { ModalButton } from '@view/modal/modal.button';
import { useRef, useState } from 'react';

type Props = { onConfirm: (invoice: InvoiceDTO) => void };

export function WalletTransactionConfirmationButton({ onConfirm }: Props) {
	const { user, wallet } = useAuth();
	const [updatedAt, setUpdatedAt] = useState(new Date());
	const formRef = useRef<{
		tonTransactionId?: string;
		valid?: boolean;
		busy?: boolean;
		error?: string | null;
		ok?: boolean;
	}>({});
	const state = formRef.current ? { ...formRef.current } : null;

	const setFormValues = (newState: Partial<typeof formRef.current>) => {
		const nextState = { ...formRef.current, ...newState };

		const isValid = !!nextState.tonTransactionId?.trim();

		formRef.current = { ...nextState, valid: isValid };
		setUpdatedAt(new Date());
	};

	const handleSubmit = async () => {
		if (!state?.busy && user) {
			setFormValues({ busy: true, error: null });

			const { tonTransactionId } = formRef.current;

			const ok = await WEB_API.post<InvoiceDTO>('/payment?type=validate', {
				body: JSON.stringify({ transactionHash: tonTransactionId, payment: CurrencyTypeEnum.TON }),
				remix: true,
			})
				.then((res) => {
					setFormValues({ busy: false, ok: true });

					if (res && res.id != null && res.status === InvoiceStatus.PAID) {
						onConfirm(res);
					}

					return true;
				})
				.catch((err) => {
					console.error('Failed to validate TON transaction:', err);
					setFormValues({
						busy: false,
						ok: false,
						error: err.message || 'Failed to validate TON transaction',
					});

					return false;
				});

			return ok ? Promise.resolve() : Promise.reject();
		} else {
			console.log('Withdrawal in progress...');
			return Promise.reject('Withdrawal in progress...');
		}
	};

	const canSubmit = state?.valid;

	return (
		<ModalButton
			buttonProps={{
				children: 'Confirm Transaction',
				layout: 'primary'
			}}
			okButtonProps={{
				disabled: !canSubmit,
				children: 'Confirm',
			}}
			beforeClose={handleSubmit}
		>
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<TextInput
						label="TON Transaction ID"
						type="text"
						id="transactionId"
						placeholder="Input address of tonkeeper wallet"
						onChange={(e) => setFormValues({ tonTransactionId: e.target.value.trim() })}
					/>
				</div>
			</div>
		</ModalButton>
	);
}
