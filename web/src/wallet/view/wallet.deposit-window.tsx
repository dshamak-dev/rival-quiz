import { Button } from '@view/button/button';
import { TextInput } from '@view/form/form.text-input';
import { ModalButton } from '@view/modal/modal.button';
import { Typography } from '@view/typography/typography';
import { FC, ReactNode, useMemo, useRef, useState } from 'react';
import { DEPOSIT_BUNDLES } from '../constants/bundles';
import { useAuth } from '@state/auth.hook';
import { InvoiceCreateDTO, InvoiceItem } from '../../invoice/type';
import classNames from 'classnames';
import { createInvoice } from 'src/invoice/api';
import { InvoiceSummary } from 'src/invoice/view/invoice.summary';
import { toCurrency } from 'src/payment/helper';
import { usePayment } from 'src/payment/state';

type Props = { trigger: ReactNode };

export const WalletDepositWindow: FC<Props> = ({ trigger }) => {
	const { user } = useAuth();
	const [formUpdatedAt, setUpdateState] = useState<number | null>(null);
	const { exchangeRates } = usePayment();
	const formRef = useRef({
		bundleId: '',
		currency: exchangeRates.USD,
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

	const selectBundle = (bundle: any) => {
		calculateTotal({ ...bundle, discountCode: '' });

		formRef.current.bundleId = bundle.id;
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

	const getInvoicePayload = () => {
		const userId = user?.id as InvoiceCreateDTO['userId'];
		const { total, discount, discountCode, totalAmount, bundleId } = formState;

		const items: InvoiceItem[] = [];
		const bundle = DEPOSIT_BUNDLES.find((b) => b.id === bundleId);

		if (bundle) {
			items.push({
				productId: bundle.id,
				discount: bundle.discount,
				quantity: bundle.value,
				total: total,
				name: bundle.title,
				metadata: bundle,
			});
		} else {
			items.push({
				productId: 'custom',
				discount: 0,
				quantity: totalAmount,
				total: total,
				name: 'Custom Amount',
				metadata: {
					discountCode,
				},
			});
		}

		const payload: InvoiceCreateDTO = {
			userId,
			total: total,
			discount: discount,
			items,
			currency: exchangeRates.USD.type,
			metadata: {
				totalAmount,
				bundleId,
			},
		};

		return payload;
	};

	const invoiceState = useMemo(() => {
		return getInvoicePayload();
	}, [formState, formUpdatedAt]);

	const handleSubmit = async () => {
		if (!user?.id) {
			return;
		}

		const invoicePayload = getInvoicePayload();

		setFormValues({ busy: true, error: '' });

		return createInvoice(invoicePayload)
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
					<Typography className="text-emerald-500">
						{toCurrency(item.value * item.discount * -1, formState.currency.buy, formState.currency.symbol)}
					</Typography>
				</Button>
			</div>
		));
	}, [formState.bundleId]);

	return (
		<ModalButton
			title={'top up balance'.toUpperCase()}
			buttonProps={{
				layout: 'text',
				children: trigger,
			}}
			okButtonProps={{
				disabled: formState.draft || !formState.valid,
				children: formState.totalAmount
					? `Deposit ${toCurrency(formState.total, formState.currency.buy, formState.currency.symbol)}`
					: 'Deposit',
			}}
			beforeClose={handleSubmit}
		>
			<div className="flex flex-col gap-6">
				<div>
					<Typography>Exchange Rate: 1 USD = {formState.currency.buy} BUNDS</Typography>
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
					<InvoiceSummary invoice={invoiceState} />
					{formState.error && <Typography className="text-red-500">{formState.error}</Typography>}
				</div>
			</div>
		</ModalButton>
	);
};
