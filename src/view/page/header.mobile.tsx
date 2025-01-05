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

export function HeaderMobile() {
	const location = useLocation();
	const navigate = useNavigate();
	const { deviceType } = useUI();
	const { isLoggedIn, user } = useAuth();

	const canGoBack = useMemo(() => {
		return !['', '/'].includes(location.pathname);
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
						<Typography className="uppercase text-xs font-black">Quizdation</Typography>
					</div>
				)}
			</div>
			<div></div>
			{isLoggedIn && (
				<>
					<div className="flex items-center justify-end gap-6">
						<Badge>
							<Icon name="Bell" size={16} className="animate-bounce" />
						</Badge>

						<div className="flex gap-2 items-center">
							<span>0</span>
							<Icon name="Coin" size={16} />
						</div>
					</div>
				</>
			)}
		</div>
	);
}
