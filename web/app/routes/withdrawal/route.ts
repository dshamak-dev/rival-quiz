import { getAuthHeaders } from '@/auth';
import { createTransaction, resolveTransaction } from '@api/transaction.api';
import { TransactionDTO } from '@model/transaction.model';
import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import { expandResponse } from '@shared/async/helpers';
import { InvoiceCreateDTO } from '@shared/invoice/type';
import { CurrencyTypeEnum } from '@shared/payment/constant';
import { TransactionCreateDTO, TransactionTypeEnum } from '@shared/transaction/type';
import { createInvoice } from 'src/invoice/api';
import { createTonTransfer, fetchTONRate, getTonAddress } from 'src/payment/api/payment.ton-api';
import { lockUserBalance } from 'src/wallet/api/wallet.api';

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
		receiverId: body.userId,
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

	// Resolve TON transaction
	// const [transferDetails, error] = await expandResponse(createTonTransfer(body.walletAddress, payload.amount));

	// Create invoice for system to withdrawal
	const invoicePayload: InvoiceCreateDTO = {
		discount: 0,
		items: [
			{
				productId: 'points',
				quantity: body.points,
				name: 'points',
				description: 'Withdrawal from TON wallet',
			},
		],
		senderType: 'system',
		senderId: 'system',
		recipientType: 'user',
		recipientId: body.userId,
		metadata: {
			paymentDetails: {
				recipientAddress: body.walletAddress,
				paymentGateway: 'TON',
				amount: payload.amount,
				currency: CurrencyTypeEnum.TON,
				details: `Withdraw ${payload.amount} TON`,
			},
		},
		currency: CurrencyTypeEnum.TON,
		total: payload.amount,
		cost: payload.amount,
	};
	const [invoice, invoiceError] = await expandResponse(createInvoice(invoicePayload));

	if (invoice && !invoiceError) {
		// Lock user balance
		await lockUserBalance(body.userId, body.points, { headers }).catch((err) => {
			console.error('Failed to lock user balance', err);
			return null;
		});

		return json(invoice, { status: 200 });
	}

	return json({ error: invoiceError || 'Failed to create invoice' }, { status: 500 });

	// if (transferDetails && !error) {
	// 	// Create transaction in the database after TON transaction is created
	// 	const transaction: TransactionDTO = await createTransaction(
	// 		{
	// 			...payload,
	// 			data: {
	// 				payment: transferDetails,
	// 				...payload.data,
	// 			},
	// 		},
	// 		{ headers }
	// 	);

	// 	const [updatedTransaction, updateError] = await expandResponse(resolveTransaction(transaction.id));

	// 	if (updateError) {
	// 		return json({ error: 'Failed to resolve transaction' }, { status: 500 });
	// 	}

	// 	return json(updatedTransaction, { status: 200 });
	// } else {
	// 	return json({ error: error }, { status: 500 });
	// }
};
