import { Anchor } from '@view/anchor';
import { Typography } from '@view/typography/typography';
import { UserAuthBadge } from '@view/user/user.auth-badge';
import classNames from 'classnames';

import logoImage from '@assets/logo.png';
import { Image } from '@view/image/image';
import { useMemo } from 'react';
import { useAuth } from '@state/auth.hook';
import { Icon } from '@view/icon';
import { Badge } from '@view/badge/badge';

export function Navigation() {
	const { isLoggedIn, user } = useAuth();

	const links = useMemo(() => {
		const _items = [
			{ link: '/', end: true, text: 'Exprole' },
			// { link: '/features', text: 'Features' },
		];

		if (user) {
			_items.push(
				{ link: '/profile', end: false, text: 'Profile' }
				// , { link: '/subscriptions', text: 'subscriptions' }
			);
		}

		_items.push({ link: '/roadmap', end: true, text: 'roadmap' });

		return _items;
	}, [user]);

	return (
		<nav
			className={classNames('grid grid-cols-[auto_1fr_auto] items-center gap-8 py-4 px-8', 'text-sm font-light')}
		>
			<div>
				<Anchor end href="/" className="relative -left-4 flex gap-2 items-center" activeClassName="">
					<Image src={logoImage} style={{ width: 24 }} />
					<Typography className="uppercase text-xs font-black">Quizdation</Typography>
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
				{isLoggedIn && (
					<>
						<div className="flex items-center justify-end gap-6">
							<Anchor href="/sessions/create">
								<Icon name="PlusCircle" size={16} />
							</Anchor>
							<Icon name="ClockHistory" size={16} />
							<Badge>
								<Icon name="Bell" size={16} className="animate-bounce" />
							</Badge>

							<Icon name="Bookmark" size={16} />

							<div className="flex gap-2 items-center">
								<span>0</span>
								<Icon name="Coin" size={16} />
							</div>
						</div>
						<div className="pl-2 mr-2 border-r h-4"></div>
					</>
				)}
				<UserAuthBadge />
			</div>
		</nav>
	);
}
