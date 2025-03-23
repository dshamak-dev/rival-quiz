import { TonClient, Address, WalletContractV5R1 } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';

export class Tonkeeper {
	static api = process.env.TON_API_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC';
	static mnemonics = (
		process.env.TON_MNEMONIC || `tone two three fork fire six seven eight note ten elder twelve`
	)?.split(' ');
	static originAddress = '0QCxEVjJhspOrZMUwnQEI-brFM1pN5m1bKYlAyqMKyW19jhq';

	static async init() {
		const client = new TonClient({
			endpoint: 'https://toncenter.com/api/v2/jsonRPC', // Use a public endpoint or your own node
		});

		const mnemonic = 'your mnemonic phrase here'; // Replace with your mnemonic
		const keyPair = await mnemonicToWalletKey(mnemonic.split(' '));

		const walletAddress = Address.parse(this.originAddress); // Replace with your wallet address
		const wallet = WalletContractV5R1.create({
			workchain: walletAddress.workChain,
			publicKey: keyPair.publicKey,
			// walletId: walletId,
		});

		console.log('Origin:', this.originAddress);
		console.log(
			'Generated address:',
			wallet.address.toString({
				urlSafe: true,
				bounceable: true,
				testOnly: true,
			})
		);
		console.log(
			'unbounceable:',
			wallet.address.toString({
				urlSafe: true,
				bounceable: false,
				testOnly: true,
			})
		);

		const balance = await wallet.getBalance(client.provider(walletAddress)).then((res) => res.toString()).catch((err) => {
			console.error('Balance Error:', err);
			return null;
		});
		console.log('Balance:', balance);

		// const provider = client.provider(walletAddress);
		// const seqno = await wallet.getSeqno(provider);

		// const destinationAddress = 'destination wallet address'; // Replace with the destination address
		// const amountToSend = 1; // Amount in TON

		// await wallet.sendTransfer(provider, {
		// 	seqno,
		// 	secretKey: keyPair.secretKey,
		// 	messages: [
		// 		{
		// 			to: destinationAddress,
		// 			value: amountToSend,
		// 			body: 'Hello, TON!', // Optional message
		// 		},
		// 	],
		// });
	}
}

// class WalletV5R1 {
//     static create(address) {
//         return new WalletV5R1(address);
//     }

//     async getSeqno(provider) {
//         const { stack } = await provider.get("seqno", []);
//         return stack.readNumber();
//     }

//     async sendTransfer(provider, args) {
//         const { seqno, secretKey, messages } = args;

//         const body = beginCell()
//             .storeUint(0x5fcc3d14, 32) // Opcode for transfer
//             .storeUint(seqno, 32)
//             .storeUint(60, 8) // Timeout
//             .storeRef(
//                 beginCell()
//                     .storeUint(0, 8) // Mode
//                     .storeRef(
//                         beginCell()
//                             .storeUint(0x10, 6) // Mode for internal message
//                             .storeAddress(Address.parse(messages[0].to))
//                             .storeCoins(messages[0].value)
//                             .storeUint(0, 1 + 4 + 4 + 64 + 32 + 1 + 1)
//                             .storeRef(
//                                 beginCell()
//                                     .storeBuffer(Buffer.from(messages[0].body || ""))
//                                     .endCell()
//                             )
//                             .endCell()
//                     )
//                     .endCell()
//             )
//             .endCell();

//         const signature = Cell.fromBoc(Buffer.from(secretKey))[0];
//         const signedBody = beginCell()
//             .storeBuffer(signature.bits.buffer)
//             .storeSlice(body.beginParse())
//             .endCell();

//         await provider.external(signedBody);
//     }
// }
