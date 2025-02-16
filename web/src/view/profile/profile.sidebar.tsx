import { useUI } from '@control/ui.control';
import { useMatches } from '@remix-run/react';
import { useAuth } from '@state/auth.hook';
import { Anchor } from '@view/anchor';
import { Icon, IconType } from '@view/icon';
import { useMemo } from 'react';

export function ProfileSidebar() {
	const { isLoggedIn, user } = useAuth();
	const { deviceType, isMobile } = useUI();
	// const navigate = useNavigate();
	const matches = useMatches();

	const links = useMemo(() => {
		const _items: { link: string; end?: boolean; text: string; icon: IconType }[] = [
			{ link: '/profile/sessions', text: 'Sessions', icon: 'Grid' },
			{ link: '/wallet', text: 'Wallet', icon: 'Wallet' },
		];

		return _items;
	}, [user]);

	const options = useMemo(() => {
		return links.map(({ link, text }) => {
			return {
				value: link,
				label: text,
			};
		});
	}, [links]);

	const activeRouteOption = useMemo(() => {
		const currentRoute = matches.at(-1);

		return options.find((it) => currentRoute?.pathname === it.value);
	}, [matches, options]);

	const content = useMemo(() => {
		if (!deviceType || isMobile) {
			return <div></div>;
		}

		return (
			<div className="flex flex-col gap-8">
				{links.map(({ link, text, end, icon }, index) => (
					<Anchor
						key={index}
						end={end}
						reloadDocument
						href={`${link}`}
						activeClassName="text-sky-600"
						inactiveClassName="opacity-30"
						className="flex gap-2 items-center text-sm text-inherit font-inherit hover:underline"
					>
						<Icon name={icon} />
						<span>{text}</span>
					</Anchor>
				))}
			</div>
		);
	}, [deviceType, isMobile, links, activeRouteOption, options]);

	return <aside className="p-4">{content}</aside>;
}
