import { TonClient, WalletContractV4, Address, internal } from '@ton/ton';
import { mnemonicNew, mnemonicToPrivateKey } from '@ton/crypto';
import qrcode from 'qrcode';
import { InvoiceDTO } from 'src/invoice/type';
import { getTonTransactionDetails } from '../helper/payment.ton-helper';

const TON_API_ENDPOINT = process.env.TON_API_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC';

// Use secure ENV vars in real apps!
let mnemonics = await mnemonicNew();
let keyPair = await mnemonicToPrivateKey(mnemonics);

const WALLET_ADDRESS = process.env.TON_WALLET_ADDRESS || '0QB_PtUnY99DYtkmFuIdXIGNFpEngvgXN1BnEDX2oF0aApkG';

const walletAddress = Address.parse(WALLET_ADDRESS);

const dummyWallet = WalletContractV4.create({
	workchain: walletAddress.workChain,
	publicKey: keyPair.publicKey,
});
// Override its address
// @ts-ignore: Rewrite Property 'address' with custom value
dummyWallet.address = walletAddress;

const client = new TonClient({ endpoint: TON_API_ENDPOINT });

export async function createTONPaymentDetails(invoice: InvoiceDTO) {
	const amountTon = await convertCurrencyToTON(invoice.cost, invoice.currency || 'usd');

	return generateQRCode(invoice.id, amountTon);
}

export async function validateTONPayment(invoice: InvoiceDTO) {
	// Find transaction by hash/id from the invoice
	const result = await client.getTransactions(walletAddress, { limit: 5 });

	let payload = null;
	let done = false;

	for (const tx of result) {
		const transactionDetails = await getTonTransactionDetails(tx);

		if (transactionDetails.comment?.includes(invoice.id)) {
			payload = { ...transactionDetails, ok: true };
			done = true;
			break;
		}
	}

	return payload;
}

export async function convertCurrencyToTON(amount: number, currency: string = 'usd'): Promise<number> {
	const exchangeRate = 1 / 3.58; // FAKE exchange rate for demonstration purposes
	const currencyCode = currency?.toLowerCase();
	// TODO: Use a real exchange rate API in a real application!
	// "rates":{"TON":{"prices":{"USD":3.7239999999999998},"diff_24h":{"USD":"+3.86%"},"diff_7d":{"USD":"+36.97%"},"diff_30d":{"USD":"−0.89%"}}}}
	const priceInUSD: any = await fetch(`https://tonapi.io/v2/rates?tokens=ton&currencies=${currencyCode}`)
		.then((res) => {
			if (res.ok) {
				return res.json();
			}

			return null;
		})
		.then((data) => {
			if (!data?.rates) {
				return null;
			}

			return data.rates.TON.prices.USD;
		})
		.catch((err) => {
			console.error('Error fetching exchange rate:', err);
			return null;
		});

	console.log('Price in USD:', priceInUSD);
	const tonPrice = priceInUSD?.toncoin?.usd || exchangeRate;
	const tonAmount = amount * tonPrice;

	return Math.max(1, tonAmount);
}

export async function generateQRCode(refId: string, amountTon: number) {
	const tonAmountNano = tonToNano(amountTon);

	const link = `ton://transfer/${WALLET_ADDRESS}?amount=${tonAmountNano}&text=Payment_for_product_${refId}`;

	const qr = await qrcode.toDataURL(link);

	return { link, qr };
}

export async function resolveTONWithdraw(recipient: string, amountTon: number) {
	const tonAmountNano = tonToNano(amountTon);

	try {
		const contract = client.open(dummyWallet);
		const seqno = await contract.getSeqno();

		await contract.sendTransfer({
			secretKey: keyPair.secretKey,
			seqno,
			messages: [
				internal({
					to: recipient,
					value: tonAmountNano,
					bounce: false,
				}),
			],
		});

		return Promise.resolve({ ok: true });
	} catch (err) {
		return Promise.reject(err || 'Withdraw failed');
	}
}

export function tonToNano(value: number) {
	// Round the value to the nearest 9 decimal places
	return BigInt(Math.round(value) * 1e9);
}
