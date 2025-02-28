import { Typography } from '@view/typography/typography';

import logoImage from '@assets/logo.png';
import { Image } from '@view/image/image';
import { findSessions } from '@api/session.api';
import { SessionList } from '@view/session/session.list';
import classNames from 'classnames';
import { useUI } from '@control/ui.control';
import { SessionDTO, SessionStateType } from '@model/session.model';
import { APP_NAME } from 'src/constants/config.constants';
import { LoaderFunctionArgs } from '@remix-run/node';
import { ShouldRevalidateFunction, useLoaderData } from '@remix-run/react';

export const shouldRevalidate: ShouldRevalidateFunction = ({ nextUrl }) => {
	return nextUrl.pathname === '/';
};

export async function loader({ request }: LoaderFunctionArgs): Promise<SessionDTO[]> {
	const data = await findSessions(`state=${[SessionStateType.Active, SessionStateType.Published]}`).then(sessions => sessions?.sort((a, b) => {
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	})).catch(
		() => undefined
	);

	return data || [];
}

export default function LandingPage() {
	const { isMobile } = useUI();
	const data = useLoaderData<typeof loader>();

	return (
		<div
			className={classNames('min-h-full p-6', {
				// 'h-full overflow-y-auto': isMobile,
				'h-fit': !isMobile,
			})}
		>
			{!data ? (
				<div className="h-screen max-h-full flex flex-col items-center justify-center">
					<Image src={logoImage} style={{ width: 48 }} className="relative -top-6 animate-bounce" />
					<Typography className="">{APP_NAME} starts here</Typography>
				</div>
			) : (
				<SessionList sessions={data as SessionDTO[]} />
			)}
		</div>
	);
}
