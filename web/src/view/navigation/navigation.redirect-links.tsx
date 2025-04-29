import { useLocation, useSearchParams } from '@remix-run/react';
import { LinkButton } from '@view/anchor/link.button';
import { useMemo } from 'react';

export function NavigationRedirectLinks() {
	const [searchParams] = useSearchParams();
	const location = useLocation();
	const redirectUrl = useMemo(() => {
		const continueUrl = searchParams.get('continue');

		return continueUrl || null;
	}, [location.pathname]);

	const redirectLinks = useMemo(() => {
		if (!redirectUrl || location.pathname.includes('/login')) {
			return [];
		}

		let redirectParts = { pathname: redirectUrl, search: '' };

		try {
			redirectParts = new URL(redirectUrl);
		} catch (error) {}

		const path = redirectParts.pathname;

		if (path.startsWith('/')) {
			return [{ href: path, text: getRedirectLinkText(path) }];
		}

		return [];
	}, [redirectUrl]);

	const content = useMemo(() => {
		if (!redirectLinks.length) {
			return null;
		}

		return (
			<div className="flex gap-2 items-center">
				{redirectLinks.map(({ href, text }, index) => (
					<LinkButton key={index} href={href} className="uppercase" size="small" layout='primary'>
						{text}
					</LinkButton>
				))}
			</div>
		);
	}, [redirectLinks]);

	return content;
}

function getRedirectLinkText(link: string): string | null {
	if (!link) {
		return null;
	}

	const [entity, ...parts] = link.replace(/^\//, '').split('/');

	switch (entity) {
		case 'sessions': {
			return 'Return to session';
		}
		default: {
			return `Return to ${entity}`;
		}
	}
}
