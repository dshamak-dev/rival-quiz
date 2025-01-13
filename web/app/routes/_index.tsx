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
import { useAuth } from '@state/auth.hook';

export default function LandingPage() {
	const { user } = useAuth();
	const { isMobile } = useUI();
	const { data, loading, dispatch } = useAPI({
		initialState: null,
		request: () =>
			findSessions(`state=${[SessionStateType.Active, SessionStateType.Published]}`).catch(() => []),
	});

	useEffect(() => {
		dispatch();
	}, []);

	const availableSessions = useMemo(() => {
		return data || [];
		// return (
		// 	data?.filter((session) => {
		// 		if (user?.id && (session.users?.includes(user?.id) || session.ownerId === user?.id)) {
		// 			return ![SessionStateType.Archived, SessionStateType.Canceled, SessionStateType.Completed].includes(
		// 				session.state
		// 			);
		// 		}

		// 		return [SessionStateType.Published].includes(session.state);
		// 	}) || []
		// );
	}, [data, user]);

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
					<Typography className="">Quizdation starts here</Typography>
				</div>
			) : (
				<SessionList sessions={availableSessions} />
			)}
		</div>
	);
}
