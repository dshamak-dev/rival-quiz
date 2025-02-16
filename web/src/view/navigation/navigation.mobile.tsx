import { useAuth } from '@state/auth.hook';
import { Anchor } from '@view/anchor';
import { Icon, IconType } from '@view/icon';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { useMemo, useRef } from 'react';
import { NavigationDrawer } from './navigation.drawer';

export function NavigationMobile() {
	const { isLoggedIn } = useAuth();
	const ref = useRef<HTMLDivElement>(null);

	const links = useMemo(() => {
		const _items: { link?: string; end?: boolean; icon?: IconType; text?: string }[] = [
			{ link: '/', end: true, icon: 'House', text: 'Home' },
		];

		if (isLoggedIn) {
			_items.push(
				{ link: '/history', end: true, icon: 'ClockHistory', text: 'History' },
				{ link: '/wallet', end: true, icon: 'Wallet2', text: 'Wallet' }
				// { link: '/profile', end: true, icon: 'Person', text: 'Profile' }
			);
		}

		return _items;
	}, [isLoggedIn]);

	const navHeight = useMemo(() => {
		return ref.current?.offsetHeight;
	}, [ref.current]);

	if (!isLoggedIn){
		return null;
	}

	return (
		<nav
			ref={ref}
			className={classNames(
				`flex items-center py-4 px-8`,
				links.length < 4 ? 'justify-center gap-6' : 'justify-between',
				'text-sm font-light border-t'
			)}
		>
			{links.map(({ end, link, text, icon }, index) => {
				if (!link) {
					return <div key={index}></div>;
				}

				return (
					<Anchor
						key={index}
						end={end}
						href={link}
						activeClassName="text-sky-700"
						className="flex flex-col gap-1 items-center"
					>
						{icon != null && <Icon name={icon} size={24} />}
						<Typography className="text-xs text-center">{text}</Typography>
					</Anchor>
				);
			})}
			<NavigationDrawer offsetY={navHeight}>
				{(open: boolean) => (
					<div className="flex flex-col gap-1 items-center">
						<Icon name={open ? 'XLg' : 'List'} size={24} />
						<Typography className="text-xs text-center">Menu</Typography>
					</div>
				)}
			</NavigationDrawer>
		</nav>
	);
}
