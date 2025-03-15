import { LinksFunction, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, useLoaderData, useNavigation } from '@remix-run/react';

import { useEffect, useMemo } from 'react';

import stylesheet from './style.css?url';
import faviconIco from '@assets/favicon.ico';
import faviconPng from '@assets/favicon.png';
import { ClientComponent } from '@view/client/client.component';
import { getAuthCookie, getContinueUrl, logOut } from '@/auth';
import { AppContextProvider } from 'src/state/app.state';
import { WEB_API } from '@control/api.control';
import { Navigation } from '@view/page/navigation';

import { Image } from '@view/image/image';
import { useUI } from '@control/ui.control';
import classNames from 'classnames';
import { DeviceType } from '@model/ui.model';
import { HeaderMobile } from '@view/page/header.mobile';
import { getUserWallet } from '@api/wallet.api';
import { BroadcastProvider } from '@state/broadcast.state';
import { DrawerProvider } from '@view/drawer/drawer.provider';
import { APP_NAME } from 'src/constants/config.constants';
import placeholderImage from '@assets/placeholders/p_01.png';

export async function loader({ request }: LoaderFunctionArgs) {
	const envVariables = process.env;

	const { host, protocol } = new URL(request.url);

	const service = envVariables.API_SERVICE;
	const API_URL = service ? `${protocol}//${envVariables.API_SERVICE}` : `${protocol}//${host}/api`;

	WEB_API.setEnv({ ...envVariables, API_URL });

	const cookie: string | null = await getAuthCookie(request);

	WEB_API.fetch('/health', {
		headers: { Cookie: cookie || '' },
	}).catch(() => null);

	let user = null;

	if (cookie) {
		user = await WEB_API.fetch('users/current', {
			method: 'GET',
			headers: { Cookie: cookie },
			credentials: 'include',
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				}

				return null;
			})
			.catch((error) => {
				return null;
			});

		if (!user) {
			return logOut(getContinueUrl(request));
		}
	}

	const wallet = await getUserWallet({ headers: { Cookie: cookie } }).catch((err) => null);

	return { user, wallet, envVariables };
}

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', as: 'style', href: stylesheet },
	{
		rel: 'shortcut icon',
		as: 'image/ico',
		href: faviconIco,
	},
	{
		rel: 'icon',
		type: 'image/png',
		as: 'image/png',
		href: faviconPng,
	},
	{
		rel: 'icon',
		type: 'image/png',
		as: 'image/png',
		href: faviconPng,
	},
	{
		rel: 'icon',
		type: 'image/png',
		as: 'image/png',
		sizes: '32x32',
		href: faviconPng,
	},
	{
		rel: 'icon',
		type: 'image/png',
		sizes: '16x16',
		as: 'image/png',
		href: faviconPng,
	},
];

const TITLE = APP_NAME || '';
const DESCRIPTION = `Platfor to create, share and play.`;

export const meta: MetaFunction = () => {
	return [
		{ title: TITLE },
		{
			property: 'og:title',
			content: TITLE,
		},
		{
			name: 'description',
			content: DESCRIPTION,
		},
		{
			property: 'og:description',
			content: DESCRIPTION,
		},
		{
			property: 'og:type',
			content: 'website',
		},
		{
			property: 'og:url',
			content: placeholderImage,
		},
	];
};

export default function App() {
	const initialData = useLoaderData<typeof loader>();
	const { state } = useNavigation();
	const { deviceType } = useUI();
	const isLoading = useMemo(() => {
		return state === 'loading';
	}, [state]);

	const isMobileView = useMemo(() => {
		return deviceType != null && [DeviceType.Mobile].includes(deviceType);
	}, [deviceType]);

	const buildNumber = initialData?.envVariables?.BUILD_NUMBER || 'N/A';

	useEffect(() => {
		WEB_API.setEnv({ ...initialData.envVariables, API_URL: '/api' });
	}, []);

	return (
		<html suppressHydrationWarning={false}>
			<head>
				<link rel="icon" href="data:image/x-icon;base64,AA" />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<script src="https://telegram.org/js/telegram-web-app.js"></script>
				<Meta />
				<Links />
			</head>
			<body>
				<main className={classNames('min-h-screen')} data-build={buildNumber}>
					{isLoading ? (
						<ClientComponent>
							<div className="h-screen max-h-full flex items-center justify-center">
								<Image src="/logo" style={{ width: 48 }} className="relative -top-6 animate-bounce" />
							</div>
						</ClientComponent>
					) : (
						<BroadcastProvider env={initialData.envVariables}>
							<AppContextProvider value={initialData}>
								<div
									className={classNames('min-h-screen', {
										'grid grid-rows-[auto_1fr]': !isMobileView && deviceType != null,
										'grid grid-rows-[auto_1fr_auto]': isMobileView,
									})}
								>
									<DrawerProvider>
										<>
											{deviceType != null && (
												<div
													className={classNames('bg-white/[.85] backdrop-blur-sm', {
														'sticky left-0 top-0 z-20': !isMobileView,
														'sticky left-0 bottom-0 z-20 order-last': isMobileView,
													})}
												>
													<Navigation />
												</div>
											)}
											{isMobileView && <HeaderMobile />}
										</>
									</DrawerProvider>
									<Outlet context={{ state }} />
								</div>
							</AppContextProvider>
						</BroadcastProvider>
					)}
				</main>
				<Scripts />
			</body>
		</html>
	);
}
