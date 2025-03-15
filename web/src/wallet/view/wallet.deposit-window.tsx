import { Button } from '@view/button/button';
import { TextInput } from '@view/form/form.text-input';
import { ModalButton } from '@view/modal/modal.button';
import { Typography } from '@view/typography/typography';
import { FC, ReactNode, useMemo, useRef, useState } from 'react';
import { DEPOSIT_BUNDLES } from '../constants/bundles';
import { fetchDepositRequest } from '../api/wallet.deposit.api';
import { useAuth } from '@state/auth.hook';
import { InvoiceItem } from '../type/wallet.invoice-type';
import classNames from 'classnames';

type Props = { trigger: ReactNode };

export const WalletDepositWindow: FC<Props> = ({ trigger }) => {
	const { user } = useAuth();
	const [_, setUpdateState] = useState<number | null>(null);
	const formRef = useRef({
		bundleId: '',
		sellRate: 9 / 1,
		buyRate: 10.25 / 1,
		subtotal: 0,
		total: 0,
		discount: 0,
		customAmount: 0,
		totalAmount: 0,
		valid: false,
		draft: true,
		busy: false,
		discountCode: '',
		error: '',
	});

	const quantityRef = useRef<HTMLInputElement>(null);
	const formState = formRef.current;

	const setFormValues = (newState: Partial<typeof formState>) => {
		formRef.current = { ...formRef.current, ...newState };
		setUpdateState(Date.now());
	};

	const calculateTotal = (data: any) => {
		const amount = data.value;
		const discount = data.discount;
		const totalDiscount = amount * discount;
		const subtotal = amount;
		const total = subtotal - totalDiscount;

		formRef.current.totalAmount = amount;
		formRef.current.subtotal = Number(subtotal.toFixed(2));
		formRef.current.discount = Number(totalDiscount.toFixed(2));
		formRef.current.total = Number(total.toFixed(2));
		formRef.current.valid = amount > 0 && total > 0;
		formRef.current.draft = false;

		setUpdateState(Date.now());
	};

	const selectBundle = (byndle: any) => {
		calculateTotal({ ...byndle, discountCode: '' });

		formRef.current.bundleId = byndle.id;
	};

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(e.target.value) || 0;

		const bundle = DEPOSIT_BUNDLES.find((b) => b.value === value);

		formRef.current.customAmount = value;

		if (bundle) {
			selectBundle(bundle);
			return;
		}

		formRef.current.bundleId = '';

		calculateTotal({ value: value, discount: 0 });
	};

	const handleSubmit = async () => {
		if (!user?.id) {
			return;
		}

		const { total, discount, totalAmount, bundleId } = formState;

		const items: InvoiceItem[] = [];
		const bundle = DEPOSIT_BUNDLES.find((b) => b.id === bundleId);

		if (bundle) {
			items.push({
				productId: bundle.id,
				quantity: 1,
				total: totalAmount,
				name: bundle.title,
				metadata: bundle,
			});
		}

		setFormValues({ busy: true, error: '' });
		return fetchDepositRequest({
			userId: user.id,
			total: total,
			discount: discount,
			items,
			metadata: {
				totalAmount,
				bundleId,
			},
		})
			.then(() => {
				// TODO: show payment window for invoice
			})
			.catch((error) => {
				setFormValues({ error: error.message });

				return Promise.reject(error.message);
			})
			.finally(() => {
				setFormValues({ busy: false });
			});
	};

	const toCurrency = (value: string | number, rate: number = formState.buyRate): string => {
		const numberValue = Number(value) / rate;
		const isNegative = numberValue < 0;
		const abs = Math.abs(numberValue);
		const formattedValue = isNegative ? `-$${abs.toFixed(2)}` : `$${abs.toFixed(2)}`;

		return formattedValue;
	};

	const bundleItems = useMemo(() => {
		return DEPOSIT_BUNDLES.map((item) => (
			<div key={item.value} className="flex items-center gap-2">
				<Button
					size="small"
					layout={formState.bundleId === item.id ? 'tertiary' : undefined}
					onClick={() => {
						if (quantityRef.current && formRef.current.customAmount !== item.value) {
							formRef.current.customAmount = 0;
							quantityRef.current.value = '';
						}

						selectBundle(item);
					}}
					className={classNames('flex flex-col gap-2')}
				>
					<Typography>{item.title}</Typography>
					<Typography>{toCurrency(item.value * item.discount * -1)}</Typography>
				</Button>
			</div>
		));
	}, [formState.bundleId]);

	return (
		<ModalButton
			title="Add Balance"
			buttonProps={{
				layout: 'text',
				children: trigger,
			}}
			okButtonProps={{
				disabled: formState.draft || !formState.valid,
				children: formState.totalAmount ? `Deposit ${toCurrency(formState.totalAmount)}` : 'Deposit',
			}}
			beforeClose={handleSubmit}
		>
			<div className="flex flex-col gap-6">
				<div>
					<Typography>Exchange Rate: 1 USD = {formState.buyRate} BUNDS</Typography>
				</div>
				<div>
					<Typography>Bundles</Typography>
					<div className="grid grid-cols-4 gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
						{bundleItems}
					</div>
				</div>
				<div>
					<div className="grid gap-2 garid-cols-[1fr_200px]" style={{ gridTemplateColumns: '1fr 200px' }}>
						<TextInput
							onRef={(el) => {
								(quantityRef as any).current = el;
							}}
							label="Custom Quantity"
							type="number"
							id="amount"
							placeholder="Input quantity"
							defaultValue={formState.customAmount || ''}
							onChange={handleAmountChange}
						/>
						<TextInput
							label="Discount Code:"
							type="text"
							id="discount"
							placeholder="Discount code"
							value={String(formState.discountCode || '')}
							disabled
							className="max-w-full"
						/>
					</div>
				</div>
				<div className="text-right">
					<Typography>Total Amount: {formState.totalAmount}</Typography>
					<Typography>Subtotal: {toCurrency(formState.subtotal)}</Typography>
					<Typography>Discount: {toCurrency(formState.discount * -1)}</Typography>
					<Typography className="font-bold">Total: {toCurrency(formState.total)}</Typography>
					{formState.error && <Typography className="text-red-500">{formState.error}</Typography>}
				</div>
			</div>
		</ModalButton>
	);
};
