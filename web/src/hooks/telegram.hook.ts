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

			const tgUser =  tgData?.initDataUnsafe?.user;

			if (!tgUser || tgUser?.id == null){
				return null;
			}

			return {
				id: tgUser.id,
                name: tgUser.username || tgUser.first_name,
                photoUrl: tgUser.photo_url,
			}
		} catch (err) {
			return null;
		}
	}, []);

	const isTelegram = useMemo(() => {
		return metadata != null && metadata.id != null;
	}, [metadata]);

	return { isTelegram, metadata };
}
