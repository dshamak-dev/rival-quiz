import { getHttpEndpoint } from '@orbs-network/ton-access';
import { KeyPair, mnemonicToWalletKey } from '@ton/crypto';
import {
	Address,
	beginCell,
	CurrencyCollection,
	internal,
	Message,
	MessageRelaxed,
	OpenedContract,
	SendMode,
	TonClient,
	WalletContractV2R2,
	WalletContractV4,
	WalletContractV5R1,
} from '@ton/ton';

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
	endpoint?: string;
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

		const _this = this;

		mnemonicToWalletKey(this.mnemonics)
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

		const transactionResult: any = await fetch(
			`${this.apiUrl}/api/v2/getTransactions?address=${this.walletPublicAddress}&limit=1&hash=${id}&to_lt=0&archival=false`
		)
			.then((res) => res.json())
			.catch((err) => {
				console.error('FindTransactionById Error:', err);
				return null;
			});

		const transaction = transactionResult?.result?.[0];

		return transaction;
	}

	async initWallet() {
		this.endpoint = await getHttpEndpoint({ network: this.isTestnet ? 'testnet' : 'mainnet' });

		this.client = new TonClient({
			endpoint: this.endpoint || `${this.apiUrl}/api/v2/jsonRPC`, // Use a public endpoint or your own node
			apiKey: this.apiKey,
		});

		// Load wallet info from TON Center
		this.walletInfo = await this.getAddressInfo();

		// Create the wallet
		await this.createWallet();

		if (this.wallet) {
			await this.validateWalletBalance();
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
					publicKey: this.keyPair.publicKey,
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

	async createWalletContractV4(
		wallet: WalletContractV2R2,
		amountTon: string,
		deploy: boolean = true
	): Promise<{ contract: OpenedContract<WalletContractV2R2>; seqno: number }> {
		if (!this.client || !this.keyPair) {
			return Promise.reject('Client and Key Pair are required');
		}

		const contractState = await this.client.getContractState(wallet.address);
		console.log('Open Contract:', contractState);

		// if (contractState.state === 'active') {
		// 	console.log('Wallet is already deployed.');
		// 	return;
		// }

		const contract = this.client.open(wallet);
		const seqno = await contract.getSeqno();

		const isDeployed = contractState?.state === 'active';

		if (isDeployed || !deploy) {
			return { contract, seqno };
		}

		if (!isDeployed && deploy) {
			console.log('Wallet is uninitialized. Deploying...');

			return Promise.reject('Failed to deploy wallet contract');

			// await contract.sendTransfer({
			// 	secretKey: this.keyPair.secretKey,
			// 	seqno,
			// 	messages: [
			// 		internal({
			// 			to: contract.address,
			// 			value: amountTon,
			// 			body: 'Deploy wallet contract',
			// 		}),
			// 	],
			// });
			/*
			const transfer = contract.createTransfer({
				seqno,
				secretKey: this.keyPair.secretKey,
				messages: [
					internal({
						to: contract.address, // Send to self to initialize
						value: amountTon, // Amount in TON (for gas)
						body: 'Deploy', // Optional message
					}),
				],
			});

			const messaveValue: CurrencyCollection = { coins: BigInt(amountTon) };
			const message: Message = {
				info: {
					src: contract.address,
					dest: contract.address,
					value: messaveValue,
				},
				body: transfer, // The body is the transfer Cell
			};

			// Send the deployment message
			await this.client.sendMessage(message).catch((error) => {
				console.log('Error sending message:', error);
				return Promise.reject(error);
			});

			return this.createWalletContractV4(wallet, amountTon, false);
			*/
		}

		return { contract, seqno };
	}

	async sendTransaction(toAddress: string, amountTon: string, comment: string): Promise<void> {
		if (!this.client || !this.walletAddress || !this.wallet) {
			return Promise.reject();
		}

		if (!this.keyPair) {
			return Promise.reject('Secret key is required');
		}

		switch (this.walletProvider) {
			case 'v4': {
				try {
					console.log('-------------------------------------------------------------------');
					console.log('Using V4 wallet provider for transfer...');
					const wallet = this.wallet as WalletContractV2R2;

					const payloadV4 = await this.createWalletContractV4(wallet, amountTon, true);

					if (!payloadV4?.contract) {
						console.error('Failed to create wallet contract');
						return;
					}

					const { contract: contractV4, seqno } = payloadV4;

					await contractV4.sendTransfer({
						secretKey: this.keyPair.secretKey,
						seqno,
						messages: [
							internal({
								to: Address.parse(toAddress),
								value: amountTon,
								body: comment,
							}),
						],
					});

					// Wait for the transaction to be confirmed

					return;
				} catch (error) {
					// console.error('Error sending transaction:', error);
					return Promise.reject(error);
				}
			}
			// case 'v5': {
			// const openedWallet = this.client.open(this.wallet as WalletContractV5R1);
			// const seqno = await openedWallet.getSeqno();
			// console.log('Seqno:', seqno);
			// const tonAmountNano = tonToNano(amountTon);

			// const body = beginCell().storeUint(0, 32).storeStringTail(comment).endCell();
			// const transferMessage: MessageRelaxed = {
			// 	info: {
			// 		src: Address.parse(toAddress),
			// 		value: amountNano,
			// 	},
			// 	body,
			// };

			// const transferV5 = await openedWallet.sendTransfer({
			// 	seqno,
			// 	secretKey: this.keyPair.secretKey,
			// 	messages: [transferMessage],
			// });

			// const contract = this.client.open(this.wallet);
			// // const seqno = await contract.getSeqno();

			// const messages: any = [
			// 	{
			// 		to: toAddress,
			// 		value: amountNano,
			// 		body: comment,
			// 	},
			// ];

			// const transferV5 = contract.sendTransfer({
			// 	seqno,
			// 	sendMode: SendMode.IGNORE_ERRORS,
			// 	secretKey: secretkey,
			// 	messages,
			// });
			// 	return transferV5;
			// }
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
