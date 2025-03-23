import { KeyPair, mnemonicToPrivateKey } from '@ton/crypto';
import { Address, TonClient, WalletContractV2R2, WalletContractV5R1 } from '@ton/ton';

export class TonManager {
	wallet?: WalletContractV5R1 | WalletContractV2R2;
	walletProvider?: 'v4' | 'v5';
	walletPublicAddress?: string;
	isTestnet?: boolean;
	walletInfo?: {
		root_hash: string;
		address: string;
		publicKey: string;
		workchainId: number;
		data: any;
	};

	apiKey?: string;
	mnemonics?: string[];
	keyPair?: KeyPair;
	client?: TonClient;
	apiUrl?: string;
	walletAddress?: Address;

	constructor({
		walletProvider,
		walletAddress,
		mnemonicics,
		apiKey,
		isTestnet,
	}: {
		walletProvider: TonManager['walletProvider'];
		walletAddress: string;
		mnemonicics: string[];
		apiKey: string;
		isTestnet?: boolean;
	}) {
		this.walletPublicAddress = walletAddress;

		this.walletAddress = Address.parse(walletAddress);

		this.isTestnet = isTestnet;
		this.apiKey = apiKey;
		this.mnemonics = mnemonicics;
		this.walletProvider = walletProvider;

		this.apiUrl = `https://${this.isTestnet ? 'testnet.' : ''}toncenter.com`;

		this.client = new TonClient({
			endpoint: `${this.apiUrl}/api/v2/jsonRPC`, // Use a public endpoint or your own node
			apiKey: this.apiKey,
		});

		const _this = this;

		mnemonicToPrivateKey(this.mnemonics)
			.then((pair) => {
				_this.keyPair = pair;
				_this.initWallet();
			})
			.catch((err) => {
				console.error('MnemonicToPrivateKey Error:', err);
			});
	}

	getPaymentAddress() {
		return this.walletPublicAddress;
	}

	async findTransactionById(id: string) {
		if (!this.walletAddress || !id) {
			console.error('Missing wallet address or transaction ID', { id });
			return;
		}

		// TODO: Implement this method to find transaction by ID
		// const transaction = await this.client?.getTransaction(this.walletAddress, '0', id).catch((err) => {
		// 	console.error('FindTransactionById Error:', err);
		// 	return null;
		// });
		const transactionResult: any = await fetch(
			`${this.apiUrl}/api/v2/getTransactions?address=${this.walletPublicAddress}&limit=1&hash=${id}&to_lt=0&archival=false`
		)
			.then((res) => res.json())
			.catch((err) => {
				console.error('FindTransactionById Error:', err);
				return null;
			});

		// console.log('Transaction Result :', transactionResult);
		// const ok = transactionResult?.ok;
		const transaction = transactionResult?.result?.[0];

		console.log('Transaction:', transaction);

		return transaction;
	}

	async initWallet() {
		// Load wallet info from TON Center
		this.walletInfo = await this.getAddressInfo();

		// Create the wallet
		await this.createWallet();

		if (this.wallet) {
			await this.validateWalletBalance();
			console.log('Wallet created successfully', this.wallet.address.toString());
			// console.log(
			// 	'Wallet bounceable:',
			// 	this.wallet.address.toString({
			// 		urlSafe: false,
			// 		bounceable: true,
			// 		testOnly: this.isTestnet,
			// 	})
			// );
			// console.log(
			// 	'Wallet:',
			// 	this.wallet.address.toString({
			// 		urlSafe: true,
			// 		bounceable: false,
			// 		testOnly: this.isTestnet,
			// 	})
			// );
			// console.log(
			// 	'Wallet Not Safe:',
			// 	this.wallet.address.toString({
			// 		urlSafe: false,
			// 		bounceable: true,
			// 		testOnly: false,
			// 	})
			// );
			console.log('-------------------------------------------------------------------');
		}
	}

	async validateWalletBalance() {
		if (!this.client || !this.walletAddress || !this.wallet) {
			return null;
		}

		await this.client
			.getBalance(this.walletAddress)
			.then((balance) => {
				console.log('Client balance:', balance);
				return balance;
			})
			.catch((err) => {
				console.error('Client balance Error:', err.message);
				return null;
			});

		const contract = this.client.provider(this.walletAddress);
		return this.wallet
			.getBalance(contract)
			.then((balance) => {
				console.log('Wallet balance:', balance);
				return balance;
			})
			.catch((err) => {
				console.error('Balance Error:', err.message);
				return null;
			});
	}

	async createWallet() {
		if (!this.walletInfo) {
			throw new Error('Wallet address info is required');
		}

		if (!this.keyPair) {
			throw new Error('Key Pair is required');
		}

		// const walletId = Number(process.env.TON_WALLET_ID) || 698983191;
		switch (this.walletProvider) {
			case 'v4':
				this.wallet = WalletContractV2R2.create({
					workchain: this.walletInfo.workchainId,
					publicKey: this.keyPair.publicKey,
				});
				break;
			case 'v5':
				this.wallet = WalletContractV5R1.create({
					workchain: this.walletInfo.workchainId,
					// address: this.walletAddress,
					publicKey: this.keyPair.publicKey,
					// privateKey: this.keyPair.privateKey,
					// walletId: walletId,
				});
				break;
			default:
				throw new Error('Invalid wallet provider');
		}
	}

	async getAddressInfo(): Promise<any> {
		return fetch(`${this.apiUrl}/api/v2/getAddressInformation?address=${this.walletAddress}`)
			.then((res) => res.json())
			.then((data) => {
				if (!data.result) {
					throw new Error('Failed to get account information');
				}

				console.log('Address:', this.walletAddress);
				console.log('Address balance', data.result.balance);

				return {
					root_hash: data.result.block_id.root_hash,
					code: data.result.code,
					workchainId: data.result.block_id.workchain,
					seqno: data.result.block_id.seqno,
					data: data.result.block_id,
				};
			})
			.catch((error) => {
				console.error(error);
				return null;
			});
	}

	// async getBalance(): Promise<string> {
	// 	return this.wallet?.balance.toString();
	// }
	async sendTransaction(toAddress: string, amountNano: string, comment: string): Promise<void> {
		// if (!this.client){
		// 	return Promise.reject
		// }

		// this.client
		// 	.getBalance(this.walletAddress)
		// 	.then((balance) => {
		// 		console.log('Client balance:', balance);
		// 		return balance;
		// 	})
		// 	.catch((err) => {
		// 		console.error('Client balance Error:', err.message);
		// 		return null;
		// 	});

		switch (this.walletProvider) {
			// case 'v4':
			//     const transaction = this.wallet.createTransaction({
			//         to: toAddress,
			//         value: BigInt(amountNano),
			//         comment: comment,
			//     });
			//     this.client.sendTransaction(transaction);
			//     break;
			case 'v5':
				// const transactionV5 = this.wallet.createTransaction({
				//     to: toAddress,
				//     value: BigInt(amountNano),
				//     comment: comment,
				// });
				// this.wallet.signTransaction(transactionV5);
				// this.client.sendTransaction(transactionV5);
				break;
			default:
				throw new Error('Invalid wallet provider');
		}
	}

	async signWithKey(message: Uint8Array, apiKey: string): Promise<Uint8Array | null> {
		return null;
		// const signature = await fetch(
		// 	`https://testnet.ton.org/v3/sign?message=${encodeURIComponent(
		// 		Buffer.from(message).toString('base64')
		// 	)}&key=${apiKey}`
		// ).then((res) => res.json());

		// return Buffer.from(signature.signature, 'base64');

		// if (signature.error) {
		//     throw new Error(`Failed to sign message: ${signature.error}`);
		// }

		// return Buffer.from(signature.signature, "base64");

		// const signature = await fetch(
		//     `https://testnet.ton.org/v3/sign?message=${encodeURIComponent(
		//         Buffer.from(message).toString("base64")
		//     )}&key=${apiKey}`
		// ).then((res) => res.json());

		// return Buffer.from(signature.signature, "base64");

		// if (signature.error) {
		//     throw new Error(`Failed to sign message: ${signature.error}`);
		// }

		// return Buffer.from(signature.signature, "base64");
	}
}
