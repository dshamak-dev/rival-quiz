import TonWeb from 'tonweb';
import { mnemonicToPrivateKey } from '@ton/crypto';

export async function initializeTonWeb() {
	try {
		const TON_API_ENDPOINT = 'https://testnet.toncenter.com/api/v2/jsonRPC';

		const tonweb = new TonWeb(new TonWeb.HttpProvider(TON_API_ENDPOINT));

		const mnemonics = (
			process.env.TON_MNEMONIC || `tone two three fork fire six seven eight note ten elder twelve`
		)?.split(' ');

		console.log('mnemonics:', mnemonics);
		const keyPair = await mnemonicToPrivateKey(mnemonics);

		const WalletClass = tonweb.wallet.all.v4R2;

		const wallet = new WalletClass(tonweb.provider, {
			publicKey: keyPair.publicKey,
			wc: 0,
		});

		// const wallet = tonweb.wallet.create({
		// 	publicKey: '96895644184651301514239766180433262135797942773724540682481529957928313860360',
		// });

		const address = await wallet.getAddress();

		const walletAddressString = address.toString(true, true, true);

		console.log('Origin:', '0QCxEVjJhspOrZMUwnQEI-brFM1pN5m1bKYlAyqMKyW19jhq');
		console.log('Origin address:', 'kQCxEVjJhspOrZMUwnQEI-brFM1pN5m1bKYlAyqMKyW19mWv');
		console.log('Raw Address:', address.toString(false)); // Workchain:Address (raw)
		console.log('User Friendly (bounceable):', address.toString(true, true, true)); // Should match your Tonkeeper
		console.log('User Friendly (non-bounceable):', address.toString(true, false, true));

		return walletAddressString;
	} catch (error) {
		console.error('Failed to initialize TonWeb:', error);
		return null;
	}
}
