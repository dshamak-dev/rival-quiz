import { useAuth } from '@state/auth.hook';
import { Anchor } from '@view/anchor';
import { Icon, IconType } from '@view/icon';
import { useMemo } from 'react';

export function ProfileSidebar() {
	const { isLoggedIn, user } = useAuth();

	const links = useMemo(() => {
		const _items: { link: string; end?: boolean; text: string; icon: IconType }[] = [
			{ link: '', end: true, text: 'General', icon: 'Person' },
			{ link: '/sessions', text: 'Sessions', icon: 'Grid' },
			{ link: '/payment', text: 'Payment', icon: 'Wallet' },
		];

		return _items;
	}, [user]);

	return (
		<aside className="flex flex-col gap-8 p-4">
			{links.map(({ link, text, end, icon }, index) => (
				<Anchor
					key={index}
					end={end}
					reloadDocument
					href={`/profile${link}`}
					activeClassName="text-sky-600"
					inactiveClassName="opacity-30"
					className="flex gap-2 items-center text-sm text-inherit font-inherit hover:underline"
				>
					<Icon name={icon} />
					<span>{text}</span>
				</Anchor>
			))}
		</aside>
	);
}
