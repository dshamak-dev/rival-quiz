import { Typography } from '@view/typography/typography';

import logoImage from '@assets/logo.png';
import { Image } from '@view/image/image';
import { useAPI } from '@api/api.hook';
import { useEffect, useMemo } from 'react';
import { findSessions } from '@api/session.api';
import { SessionList } from '@view/session/session.list';
import classNames from 'classnames';
import { useUI } from '@control/ui.control';
import { SessionStateType } from '@model/session.model';
import { APP_NAME } from 'src/constants/config.constants';

export default function LandingPage() {
	const { isMobile } = useUI();
	const { data, loading, dispatch } = useAPI({
		initialState: undefined,
		request: () =>
			findSessions(`state=${[SessionStateType.Active, SessionStateType.Published]}`).catch(() => undefined),
	});

	useEffect(() => {
		dispatch();
	}, []);

	return (
		<div
			className={classNames('min-h-full p-6', {
				'h-full overflow-y-auto': isMobile,
				'h-fit': !isMobile,
			})}
		>
			{loading || !data ? (
				<div className="h-screen max-h-full flex flex-col items-center justify-center">
					<Image src={logoImage} style={{ width: 48 }} className="relative -top-6 animate-bounce" />
					<Typography className="">{APP_NAME} starts here</Typography>
				</div>
			) : (
				<SessionList sessions={data} />
			)}
		</div>
	);
}
