import { CurrencyTypeEnum } from '@shared/payment/constant';
import { TextInput } from '@view/form/form.text-input';
import { Typography } from '@view/typography/typography';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WithdrawalSummary } from './wallet.withdrawal-summary';
import { Button } from '@view/button/button';
import { WEB_API } from '@control/api.control';
import { useAuth } from '@state/auth.hook';

export function WithdrawalForm() {
	const { user, wallet } = useAuth();
	const [updatedAt, setUpdatedAt] = useState(new Date());
	const formRef = useRef<any>({
		points: 0,
		error: '',
		currency: CurrencyTypeEnum.TON,
		totalAmount: 0,
		address: '',
		valid: false,
		draft: true,
		busy: false,
		exchange: null,
		rate: 0,
	});
	const state = formRef.current ? { ...formRef.current } : null;

	const setFormValues = (newState: Partial<typeof formRef.current>) => {
		const nextState = { ...formRef.current, ...newState };

		const isValid = !!nextState.address?.trim() && nextState.points > 0;

		formRef.current = { ...nextState, valid: isValid };
		setUpdatedAt(new Date());
	};

	const handleSetExchange = (rates: Record<CurrencyTypeEnum, number>) => {
		const currency = formRef.current.currency as CurrencyTypeEnum;

		if (!rates || !currency || !rates[currency]) {
			return;
		}

		const rate = rates[currency];

		setFormValues({ exchange: rates, rate });
	};

	const handlePointsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const points = parseInt(event.target.value);

		// Validate user balance limits
		const total = points / state?.rate;
		const totalAmount = total?.toFixed(2) || 0;

		setFormValues({ points, totalAmount });
	};

	const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormValues({ address: event.target.value });
	};

	useEffect(() => {
		WEB_API.get<{ rates: Record<CurrencyTypeEnum, number> }>('/withdrawal', { remix: true })
			.then(({ rates }) => {
				if (!rates) {
					return;
				}

				handleSetExchange(rates);
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	const canWithdraw = useMemo(() => {
		return state.valid;
	}, [state]);

	const handleSubmit = () => {
		if (!state.busy && user) {
			setFormValues({ busy: true });

			const { points, address, totalAmount, currency } = formRef.current;

			WEB_API.post('/withdrawal', {
				body: JSON.stringify({ senderId: user.id, points, walletAddress: address, totalAmount, currency }),
				remix: true,
			});

			setFormValues({ busy: false, error: 'Withdrawal failed' });
		} else {
			console.log('Withdrawal in progress...');
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<TextInput
					label="Tonkeeper wallet address"
					type="text"
					id="address"
					placeholder="Input address of tonkeeper wallet"
					onChange={handleAddressChange}
				/>
				<TextInput
					label="Points"
					type="number"
					id="points"
					placeholder="Input amount of points"
					onChange={handlePointsChange}
				/>
			</div>
			<div className="text-right">
				<WithdrawalSummary points={state?.points} currency={state?.currency} rate={state?.rate} />
				{state?.error && <Typography className="text-red-500">{state.error}</Typography>}
			</div>
			<div className="flex justify-center">
				<Button disabled={!canWithdraw} layout="primary" onClick={handleSubmit}>
					Withdraw {state?.totalAmount} {state?.currency}
				</Button>
			</div>
		</div>
	);
}
