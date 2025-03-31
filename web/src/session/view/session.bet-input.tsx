import { TextInput } from '@view/form/form.text-input';
import { useState } from 'react';
import { useWallet } from 'src/wallet/state';

type Props = {
	onChange: (value: number) => void;
	initialValue?: number;
	disabled?: boolean;
};

export function SessionBetInput({ disabled, initialValue, onChange }: Props) {
	const { balance } = useWallet();
	const [error, setError] = useState<string | undefined>();

	const handleChange = (value: number) => {
		if (value <= 0) {
			setError('Invalid bet amount');
			return;
		}

		if (value > balance) {
			setError('Insufficient funds');
			return;
		}

		onChange(value);
		setError(undefined);
	};

	return (
		<div>
			<TextInput
				label="Bet amount"
				required
				defaultValue={initialValue}
				disabled={disabled}
				onChange={(e, value) => handleChange(value)}
				type="number"
				layout={error ? 'error' : 'outline'}
			/>
			{error && <div className="text-red-500">{error}</div>}
		</div>
	);
}
