import { CurrencyTypeEnum } from '@shared/payment/constant';
import { Typography } from '@view/typography/typography';
import { useMemo } from 'react';
import { toCurrency } from 'src/payment/helper';

type Props = {
	points?: number;
	currency?: CurrencyTypeEnum;
	rates?: Record<CurrencyTypeEnum, number>;
};

export function WithdrawalSummary({ points = 0, currency, rates }: Props) {
	const rate = useMemo(() => (currency ? rates?.[currency] || 0 : 0), [currency, rates]);
	const subtotal = useMemo(() => {
		return [
			{ title: 'Points', value: points },
			{ title: 'USD', value: toCurrency(points, rates?.usd || 0) },
		];
	}, [points, rates]);

	return (
		<>
			{subtotal.map(({ title, value }, index) => (
				<Typography key={index}>
					{title}: {value}
				</Typography>
			))}
			<Typography className="font-bold">
				Total: {toCurrency(points, rate)} {currency}
			</Typography>
		</>
	);
}
