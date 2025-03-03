import { useAuth } from '@state/auth.hook';
import { Anchor } from '@view/anchor';
import { Badge } from '@view/badge/badge';
import { Image } from '@view/image/image';
import { Typography } from '@view/typography/typography';
import { WalletBalance } from '@view/wallet/wallet.balance';
import { useBroadcast } from '@state/broadcast.state';
import { APP_NAME } from 'src/constants/config.constants';
import classNames from 'classnames';
import { useMemo, useRef } from 'react';

import logoImage from '@assets/logo.png';
import { Icon } from '@view/icon';
import { useTelegram } from 'src/hooks/telegram.hook';
import { NavigationDrawer } from './navigation.drawer';
import { LinkButton } from '@view/anchor/link.button';
import { useLocation } from '@remix-run/react';

export function NavigationDesktop() {
	const location = useLocation();
	const { isLoggedIn, user } = useAuth();
	const { isTelegram } = useTelegram();
	const { isConnected } = useBroadcast();
	const ref = useRef<HTMLDivElement>(null);

	const isLogin = useMemo(() => {
		return location.pathname.includes('/login');
	}, [location.pathname]);

	const links = useMemo(() => {
		const _items = [
			{ link: '/explore', end: true, text: 'Explore' },
		];

		_items.push({ link: '/roadmap', end: true, text: 'roadmap' });

		return _items;
	}, [user]);

	const navHeight = useMemo(() => {
		return ref.current?.offsetHeight;
	}, [ref.current]);

	return (
		<nav
			ref={ref}
			className={classNames(
				'grid grid-cols-[auto_1fr_auto] items-center gap-8 py-4',
				'sticky top-0 z-20 bg-white ',
				'text-sm font-light',
				isTelegram ? 'px-16' : 'px-8'
			)}
		>
			<div>
				<Anchor end href="/explore" className="relative -left-4 flex gap-2 items-center" activeClassName="">
					<Image src={logoImage} style={{ width: 24 }} />
					<Badge visible={isConnected} color="#71f8ce" transform="translateX(8px) translateY(4px)">
						<Typography className="uppercase text-xs font-black">{APP_NAME}</Typography>
					</Badge>
				</Anchor>
			</div>
			<div className="flex gap-8">
				{links.map(({ link, text, end }, index) => (
					<Anchor
						key={index}
						end={end}
						href={link}
						activeClassName="font-bold"
						className="uppercase text-inherit font-inherit hover:underline"
					>
						{text}
					</Anchor>
				))}
			</div>
			<div className="flex items-center justify-end gap-6">
				<div className="flex items-center justify-end gap-6">
					{isLoggedIn ? (
						<>
							<Badge visible>
								<Icon name="Bell" size={16} className="animate-bounce" />
							</Badge>
							<WalletBalance />
						</>
					) : (
						!isLogin && (
							<LinkButton layout="primary" href="/login" className="px-8">
								Login
							</LinkButton>
						)
					)}
				</div>

				<NavigationDrawer offsetY={navHeight} />
			</div>
		</nav>
	);
}
