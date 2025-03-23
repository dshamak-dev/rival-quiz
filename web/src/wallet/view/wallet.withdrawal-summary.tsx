import { CurrencyTypeEnum } from '@shared/payment/constant';
import { Typography } from '@view/typography/typography';
import { toCurrency } from 'src/payment/helper';

type Props = {
	points?: number;
	currency?: CurrencyTypeEnum;
	rate?: number;
};

export function WithdrawalSummary({ points = 0, currency, rate = 0 }: Props) {
	return (
		<>
			<Typography>Points: {points}</Typography>
			<Typography>Amount: {toCurrency(points, rate)} {currency}</Typography>
		</>
	);
}
