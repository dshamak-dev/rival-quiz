import { Anchor } from '@view/anchor';
import { TextInput } from '@view/form/form.text-input';
import { useEffect, useRef, useState } from 'react';
import { useWallet } from 'src/wallet/state';

type Props = {
	onChange: (value: number) => void;
	initialValue?: number;
	disabled?: boolean;
	seed?: number | string;
};

export function SessionBetInput({ disabled, initialValue, seed, onChange }: Props) {
	const { balance } = useWallet();
	const [error, setError] = useState<string | undefined>();
	const ref = useRef<HTMLInputElement>(null);

	const handleValidate = (value: number) => {
		if (Number.isNaN(value)) {
			setError('');
			return false;
		}

		if (value <= 0) {
			setError('Invalid bet amount');
			return false;
		}

		if (value > balance) {
			setError('Insufficient funds');
			return false;
		}

		setError(undefined);
		return true;
	};

	const handleChange = (value: number) => {
		const isValid = !Number.isNaN(value);

		if (isValid && String(value).includes('.') && value > Number(value)) {
			// Wait for decimals
			return;
		}

		handleValidate(value);

		onChange(value);
	};

	useEffect(() => {
		if (ref.current) {
			ref.current.value = String(initialValue || '');
		}
		handleValidate(Number(initialValue));
	}, [seed]);

	return (
		<div>
			<TextInput
				onRef={(el) => ((ref as any).current = el)}
				label="Bet amount"
				required
				defaultValue={initialValue}
				disabled={disabled}
				onChange={(e, value) => handleChange(value)}
				onBlur={(e) => handleValidate(Number(e.target.value))}
				type="number"
				inputProps={{
					min: 0,
				}}
				layout={error != null ? 'error' : 'outline'}
			/>
			{error && (
				<div className="flex flex-col gap-1 items-center">
					<span className="text-red-500">{error}</span>
					<Anchor className="underline capitalize" href="/wallet" redirect>
						add funds
					</Anchor>
				</div>
			)}
		</div>
	);
}
