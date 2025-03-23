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

TonApi.addManager(
	new TonManager({
		walletAddress: '0QCnShxr33YFFRpgHQk6hM_MboASShEYTrJfK2xvMzX3RieX',
		mnemonicics:
			`author, frequent, wreck, holiday, smile, load, tired, visa, rhythm, night, wing, fringe, fabric, salon, harvest field spell grass because bread top board kind thrive`
				.split(',')
				.map((it) => it.trim()),
		isTestnet: true,
		walletProvider: 'v5',
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

// new TonManager({
// 	walletAddress: '0QCxEVjJhspOrZMUwnQEI-brFM1pN5m1bKYlAyqMKyW19jhq',
// 	mnemonicics: process.env.TON_MNEMONIC?.split(',') || [
// 		'tone',
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
// 	walletProvider: 'v5',
// 	apiKey: process.env.TON_API_KEY || 'd38748e54fa4314eeddb770afe9994c28dc881e90e585c74aa9d661f6a94dd02',
// });

// class TonManager {
// 	static walletAddress: Address;
// 	static wallet: WalletContractV4;

// 	static async initialize() {
// 		const WALLET_ADDRESS = process.env.TON_WALLET_ADDRESS || '0QCxEVjJhspOrZMUwnQEI-brFM1pN5m1bKYlAyqMKyW19jhq';

// 		console.log('Origin:', WALLET_ADDRESS);
// 		console.log('Origin address:', 'kQCxEVjJhspOrZMUwnQEI-brFM1pN5m1bKYlAyqMKyW19mWv');

// 		const walletAddress = Address.parse(WALLET_ADDRESS);
// 		const walletId = Number(process.env.TON_WALLET_ID) || 698983191;

// 		this.walletAddress = walletAddress;

// 		const _wallet = WalletContractV4.create({
// 			workchain: walletAddress.workChain,
// 			publicKey: keyPair.publicKey,
// 			// walletId: walletId,
// 		});

// 		try {
// 			const client = new TonClient({ endpoint: TON_API_ENDPOINT });
// 			const walletContract = client.open(_wallet);

// 			const balance = await walletContract
// 				.getBalance()
// 				.then((res) => res.toString())
// 				.catch((err) => null);

// 			console.log('Initial balance:', balance);

// 			console.log('Public key:', keyPair.publicKey.toString('hex'));

// 			if (_wallet?.address.toString() !== WALLET_ADDRESS) {
// 				console.log(WALLET_ADDRESS, '!=', _wallet.address.toString());
// 				console.error('WalletId or key mismatch! Try a different walletId.');
// 				return;
// 			}

// 			this.wallet = _wallet;
// 		} catch (err) {
// 			console.error('Error initializing wallet:', err);
// 			return null;
// 		}
// 	}
// }

// export async function validateTONPayment(invoice: InvoiceDTO) {
// 	// Find transaction by hash/id from the invoice
// 	const result = await client.getTransactions(TonManager.walletAddress, { limit: 5 });

// 	let payload = null;
// 	let done = false;

// 	for (const tx of result) {
// 		const transactionDetails = await getTonTransactionDetails(tx);

// 		if (transactionDetails.comment?.includes(invoice.id)) {
// 			payload = { ...transactionDetails, ok: true };
// 			done = true;
// 			break;
// 		}
// 	}

// 	return payload;
// }

export async function createTonTransaction(recipient: string, amountTon: number) {
	const tonAmountNano = tonToNano(amountTon);
	const manager = TonApi.activeManager;

	try {
		// const wallet = TonManager.wallet;

		// if (!wallet) {
		// 	return null;
		// }

		// const contract = client.open(wallet);

		// const balance = await contract.getBalance();

		// console.log('Current balance:', balance);

		// const seqno = await contract.getSeqno();

		// const tr = await contract.sendTransfer({
		// 	secretKey: keyPair.secretKey,
		// 	seqno,
		// 	messages: [
		// 		internal({
		// 			to: recipient,
		// 			value: tonAmountNano,
		// 			bounce: false,
		// 		}),
		// 	],
		// });
		const tonTransaction = await manager.sendTransaction(
			recipient,
			tonAmountNano.toString(),
			`Wallet withdrawal #${Date.now()}`
		);

		console.log('Transaction sent:', tonTransaction);

		return Promise.resolve({ recipient, amount: amountTon, tonTransaction });
	} catch (err) {
		return Promise.reject(err || 'Withdraw failed');
	}
}

export function tonToNano(value: number) {
	// Round the value to the nearest 9 decimal places
	return BigInt(Math.round(value) * 1e9);
}
