import { LinksFunction, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, useLoaderData, useNavigation } from '@remix-run/react';

import { useEffect, useMemo } from 'react';

import stylesheet from './style.css?url';
import faviconIco from '@assets/favicon.ico';
import faviconPng from '@assets/favicon.png';
import { ClientComponent } from '@view/client/client.component';
import { getAuthCookie, logOut } from '@/auth';
import { AppContextProvider } from 'src/state/app.state';
import { WEB_API } from '@control/api.control';
import { findUserByToken } from '@api/user.api';
import { Navigation } from '@view/page/navigation';

import logoImage from '@assets/logo.png';
import { Image } from '@view/image/image';
import { useUI } from '@control/ui.control';
import classNames from 'classnames';
import { DeviceType } from '@model/ui.model';
import { HeaderMobile } from '@view/page/header.mobile';
import { getUserWallet } from '@api/wallet.api';
import { BroadcastProvider } from '@state/broadcast.state';

export async function loader({ request }: LoaderFunctionArgs) {
	const envVariables = process.env;

	// const { origin, host, protocol, port } = new URL(request.url);
	// console.log('App initialData', { origin, host, protocol, port });

	WEB_API.setEnv({ ...envVariables, API_URL: envVariables.SERVER_API_URL });

	const token: string | null = await getAuthCookie(request);

	if (token) {
		WEB_API.setJWT(token);
	}

	WEB_API.get('/health')
		.then((res) => {
			console.log('API is up and running', res);
		})
		.catch((err) => {
			console.error('API is not available', { err });
		});

	let user = null;

	if (token) {
		user = await findUserByToken().catch((err) => null);

		if (!user) {
			const url = request.url;
			WEB_API.setJWT(null);
			throw await logOut(url);
		}
	}

	const wallet = await getUserWallet().catch((err) => null);

	return { token, user, wallet, envVariables };
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

const TITLE = 'Quiz Rivals';

export const meta: MetaFunction = () => {
	return [
		{ title: TITLE },
		{
			property: 'og:title',
			content: TITLE,
		},
		{
			name: 'description',
			content: 'Quizz Platform',
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

	useEffect(() => {
		const API_URL = `${window.location.protocol}//${window.location.hostname}:${initialData.envVariables.API_PORT}`;

		WEB_API.setEnv({ ...initialData.envVariables, API_URL });

		if (initialData.token) {
			WEB_API.setJWT(initialData.token);
		}

		WEB_API.get('/health').catch((err) => {
			console.error('API is not up and running', { err, url: WEB_API.apiUrl });
		});
	}, []);

	return (
		<html suppressHydrationWarning={true}>
			<head>
				<link rel="icon" href="data:image/x-icon;base64,AA" />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<main className="min-h-screen">
					{isLoading ? (
						<ClientComponent>
							<div className="h-screen max-h-full flex items-center justify-center">
								<Image
									src={logoImage}
									style={{ width: 48 }}
									className="relative -top-6 animate-bounce"
								/>
							</div>
						</ClientComponent>
					) : (
						<BroadcastProvider env={initialData.envVariables}>
							<AppContextProvider value={initialData}>
								<div
									className={classNames('max-h-full h-screen', {
										'grid grid-rows-[auto_1fr]': !isMobileView && deviceType != null,
										'grid grid-rows-[auto_1fr_auto]': isMobileView,
									})}
								>
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
