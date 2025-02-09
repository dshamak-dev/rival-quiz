import { useMemo } from 'react';

declare global {
	interface Window {
		Telegram: {
			WebApp: any;
		};
	}
}

export function useTelegram() {
	const metadata = useMemo(() => {
		try {
			const tgData = window.Telegram?.WebApp;

			return tgData?.initDataUnsafe.user;
		} catch (err) {
			return null;
		}
	}, []);

	const isTelegram = useMemo(() => {
		return metadata != null;
	}, [metadata]);

	return { isTelegram, metadata };
}
