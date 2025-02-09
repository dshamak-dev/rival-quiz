import { useMemo } from 'react';
import { useAuth } from '@state/auth.hook';
import { Icon } from '@view/icon';
import { Badge } from '@view/badge/badge';
import { useUI } from '@control/ui.control';
import { DeviceType } from '@model/ui.model';
import { useLocation, useNavigate } from '@remix-run/react';
import { Image } from '@view/image/image';
import { Typography } from '@view/typography/typography';

import logoImage from '@assets/logo.png';
import { WalletBalance } from '@view/wallet/wallet.balance';
import { Anchor } from '@view/anchor';
import { useBroadcast } from '@state/broadcast.state';
import { APP_NAME } from 'src/constants/config.constants';

export function HeaderMobile() {
	const location = useLocation();
	const navigate = useNavigate();
	const { deviceType } = useUI();
	const { isLoggedIn, user } = useAuth();
	const { isConnected } = useBroadcast();

	const canGoBack = useMemo(() => {
		return false;
		// return !['', '/'].includes(location.pathname);
	}, [location.pathname]);

	if (deviceType !== DeviceType.Mobile) {
		return null;
	}

	return (
		<div className="sticky top-0 z-20 bg-white grid grid-cols-[auto_1fr_auto] gap-4 py-3 px-4 border-b">
			<div>
				{canGoBack ? (
					<div onClick={() => navigate(-1)}>
						<Icon name="ArrowLeft" size={22} />
					</div>
				) : (
					<div className="flex gap-2 items-center">
						<Image src={logoImage} style={{ width: 24 }} />
						<Badge visible={isConnected} color="#71f8ce" transform="translateX(8px) translateY(4px)">
							<Typography className="uppercase text-xs font-black">{APP_NAME}</Typography>
						</Badge>
					</div>
				)}
			</div>
			<div></div>
			{isLoggedIn && (
				<>
					<div className="flex items-center justify-end gap-6">
						<Anchor href="/sessions/create">
							<Icon name="PlusCircle" size={16} />
						</Anchor>
						<Badge>
							<Icon name="Bell" size={16} className="animate-bounce" />
						</Badge>

						<WalletBalance />
					</div>
				</>
			)}
		</div>
	);
}
