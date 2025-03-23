// import { TonClient, WalletContractV4, Address, internal, Cell, beginCell } from '@ton/ton';
// import { mnemonicToPrivateKey } from '@ton/crypto';
import qrcode from 'qrcode';
// import { InvoiceDTO } from 'src/invoice/type';
// import { getTonTransactionDetails } from '../helper/payment.ton-helper';
// import { initializeTonWeb } from './payment.ton-web';
// import { Tonkeeper } from '../model/_demo-ton';
import { InvoiceDTO } from '@shared/invoice/type';
import { TonManager } from '../model/ton-manager';

// const TON_API_ENDPOINT = process.env.TON_API_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC';

// const mnemonics = (process.env.TON_MNEMONIC || `tone two three fork fire six seven eight note ten elder twelve`)?.split(
// 	' '
// );
// const keyPair = await mnemonicToPrivateKey(mnemonics);

// new TonManager({
// 	walletAddress: process.env.TON_WALLET_ADDRESS || '0QB_PtUnY99DYtkmFuIdXIGNFpEngvgXN1BnEDX2oF0aApkG',
// 	mnemonicics: process.env.TON_MNEMONIC?.split(',') || [
// 		'one',
// 		'two',
// 		'three',
// 		'fork',
// 		'fire',
// 		'six',
// 		'seven',
// 		'eight',
// 		'note',
// 		'ten',
// 		'elder',
// 		'twelve',
// 	],
// 	isTestnet: true,
// 	walletProvider: 'v4',
// 	apiKey: process.env.TON_API_KEY || 'd38748e54fa4314eeddb770afe9994c28dc881e90e585c74aa9d661f6a94dd02',
// });

export async function getTonAddress() {
	return TonApi.activeManager.walletAddress?.toString();
}

export async function createTonPaymentIntent(invoice: InvoiceDTO) {
	return TonApi.getPaymentDetails(invoice);
}

export async function validateTonPayment(tonTransactionId: string) {
	return TonApi.findByTransactionId(tonTransactionId);
}

class TonApi {
	static activeManager: TonManager;

	static addManager(manager: TonManager) {
		TonApi.activeManager = manager;
	}

	static async getPaymentDetails(invoice: InvoiceDTO): Promise<{ link: string; qrCode: string }> {
		const amountTon = await this.convertToTON(invoice.cost, invoice.currency || 'usd');

		console.log('Converting amount to TON:', invoice.cost, '->', amountTon, {
			currency: invoice.currency,
		});
		return this.generateQRCode(invoice.id, amountTon);
	}

	static async convertToTON(amount: number, currency: string): Promise<number> {
		const currencyCode = currency?.toLowerCase();

		const currencyRate: any = await fetchTONRate(currencyCode)
			.then((res) => {
				return res?.rate;
			})
			.catch((error) => {
				console.error('Error fetching currency rate:', error);
				return null;
			});

		const tonPrice = currencyRate || 0;

		const tonAmount = amount / tonPrice;

		return tonAmount || 0;
	}

	static async generateQRCode(refId: string, amountTon: number) {
		const tonAmountNano = tonToNano(amountTon);

		const address = this.activeManager.getPaymentAddress();

		const link = `ton://transfer/${address}?amount=${tonAmountNano}&text=Payment_for_product_${refId}`;

		const qr = await qrcode.toDataURL(link);

		return { link, qrCode: qr };
	}

	static async findByTransactionId(id: string) {
		const tonTransaction = await TonApi.activeManager.findTransactionById(id);

		if (!tonTransaction) {
			console.error('No transaction found with ID:', id);
			return null;
		}

		const message = tonTransaction.in_msg?.message;
		const parts = message ? message.match(/payment_for_product_(.+)$/i) : null;

		const payload = {
			invoiceId: parts?.[1],
			paymentDetails: {
				address: tonTransaction.address,
				fee: tonTransaction.fee,
				other_fee: tonTransaction.other_fee,
				transaction_id: tonTransaction.transaction_id,
			},
		};

		return payload;
	}
}

// TonApi.addManager(
// 	new TonManager({
// 		walletAddress: '0QCnShxr33YFFRpgHQk6hM_MboASShEYTrJfK2xvMzX3RieX',
// 		mnemonicics:
// 			`author, frequent, wreck, holiday, smile, load, tired, visa, rhythm, night, wing, fringe, fabric, salon, harvest field spell grass because bread top board kind thrive`
// 				.split(',')
// 				.map((it) => it.trim()),
// 		isTestnet: true,
// 		walletProvider: 'v5',
// 		apiKey: process.env.TON_API_KEY || 'd38748e54fa4314eeddb770afe9994c28dc881e90e585c74aa9d661f6a94dd02',
// 	})
// );
TonApi.addManager(
	new TonManager({
		walletAddress: '0QCE4N98LCVvlpBRBg-t1ewRoMdYsPt5WjoNWR_8ay_N-PQQ',
		mnemonicics:
			`author, frequent, wreck, holiday, smile, load, tired, visa, rhythm, night, wing, fringe, fabric, salon, harvest field spell grass because bread top board kind thrive`
				.split(',')
				.map((it) => it.trim()),
		isTestnet: true,
		walletProvider: 'v4',
		apiKey: process.env.TON_API_KEY || 'd38748e54fa4314eeddb770afe9994c28dc881e90e585c74aa9d661f6a94dd02',
	})
);

export async function fetchTONRate(currency: string) {
	return fetch(`https://tonapi.io/v2/rates?tokens=ton&currencies=${currency}`)
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

			const prices = data.rates.TON.prices;

			const rateEntrie = Object.entries(prices).find(([key]) => key.toLowerCase() === currency);

			const rate: number = Number(String(rateEntrie?.[1] || 0)) || 0;

			console.log('TON prices:', prices);

			return { prices, rate };
		})
		.catch((err) => {
			console.error('Error fetching exchange rate:', err);
			return null;
		});
}

export async function createTonTransfer(recipient: string, amountTon: number) {
	const manager = TonApi.activeManager;

	try {
		await manager.sendTransaction(recipient, amountTon.toString(), `Wallet withdrawal #${Date.now()}`);

		console.log('Transaction sent:');

		return Promise.resolve({ recipient, amount: amountTon });
	} catch (err) {
		return Promise.reject(err || 'Withdraw failed');
	}
}

export function tonToNano(value: number) {
	// Round the value to the nearest 9 decimal places
	return BigInt(Math.round(value) * 1e9);
}
