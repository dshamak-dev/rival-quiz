import { getAuthHeaders } from '@/auth';
import { createTransaction, resolveTransaction } from '@api/transaction.api';
import { WEB_API } from '@control/api.control';
import { TransactionDTO } from '@model/transaction.model';
import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import { expandResponse } from '@shared/async/helpers';
import { CurrencyTypeEnum } from '@shared/payment/constant';
import { TransactionCreateDTO, TransactionTypeEnum } from '@shared/transaction/type';
import { createTonTransaction, fetchTONRate, getTonAddress } from 'src/payment/api/payment.ton-api';

export async function loader({ request }: LoaderFunctionArgs) {
	const tonToUsd = await fetchTONRate('usd');

	const exchangeRates = {
		[CurrencyTypeEnum.TON]: 0,
		[CurrencyTypeEnum.USD]: 10.25,
		[CurrencyTypeEnum.POINTS]: 1,
	};

	if (tonToUsd?.rate) {
		exchangeRates[CurrencyTypeEnum.TON] = exchangeRates[CurrencyTypeEnum.USD] * tonToUsd.rate;
	}

	return json({ rates: exchangeRates });
}

export const action = async ({ request }: ActionFunctionArgs) => {
	const headers = await getAuthHeaders(request).catch((err) => null);

	if (!headers) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	console.log('Processing withdrawal request');
	const body = await request.json().catch((err) => {
		console.error('Failed to parse JSON payload', err);
		return null;
	});

	if (!body) {
		console.error('Invalid payload');
		return json({ error: 'Invalid payload' }, { status: 400 });
	}

	let payload: TransactionCreateDTO = {
		senderId: '',
		senderType: 'system',
		receiverId: body.senderId,
		receiverType: 'user',
		type: TransactionTypeEnum.Withdrawal,
		amount: body.totalAmount,
		currency: body.currency,
		data: {
			points: body.points,
			totalAmount: body.totalAmount,
			currency: body.currency,
			walletAddress: body.walletAddress,
		},
		reference: body.reference,
		details: body.details || `Withdraw ${body.totalAmount} ${body.currency.toLowerCase()}`,
	};

	switch (body.currency) {
		case CurrencyTypeEnum.TON: {
			const senderId = await getTonAddress().catch((err) => {
				console.error('Failed to get TON address', err);
				return null;
			});

			if (!senderId) {
				return json({ error: 'Failed to get TON address' }, { status: 400 });
			}

			payload.senderId = senderId;
			break;
		}
		default: {
			return json({ error: 'Unsupported currency' }, { status: 400 });
		}
	}

	console.log('Processing withdrawal payload:', payload);

	const transaction: TransactionDTO = await createTransaction(payload, { headers });

	// Resolve TON transaction
	const [paymentDetails, error] = await expandResponse(createTonTransaction(payload.receiverId, payload.amount));

	if (paymentDetails && !error) {
		const [updatedTransaction, updateError] = await expandResponse(
			resolveTransaction(transaction.id, {
				paymentDetails,
			})
		);

		if (updateError) {
			return json({ error: 'Failed to resolve transaction' }, { status: 500 });
		}

		return json(updatedTransaction, { status: 200 });
	} else {
		return json({ error: error }, { status: 500 });
	}
};
