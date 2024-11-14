import { Typography } from '@view/typography/typography';

import logoImage from '@assets/logo.png';
import { Image } from '@view/image/image';
import { useAPI } from '@api/api.hook';
import { useEffect } from 'react';
import { findSessions } from '@api/session.api';
import { SessionList } from '@view/session/session.list';
import classNames from 'classnames';
import { useUI } from '@control/ui.control';

export default function LandingPage() {
	const { isMobile } = useUI();
	const { data, loading, dispatch } = useAPI({ initialState: null, request: () => findSessions().catch(() => []) });

	useEffect(() => {
		dispatch();
	}, []);

	return (
		<div className={classNames('min-h-full p-6', {
			'h-full overflow-y-auto': isMobile,
			'h-fit': !isMobile
		})}>
			{loading || !data ? (
				<div className="h-screen max-h-full flex flex-col items-center justify-center">
					<Image src={logoImage} style={{ width: 48 }} className="relative -top-6 animate-bounce" />
					<Typography className="">Quizdation starts here</Typography>
				</div>
			) : (
				<div className="flex flex-col gap-4">
					{/* <Typography className="text-lg font-bold">Sessions</Typography> */}
					<SessionList sessions={data} />
				</div>
			)}
		</div>
	);
}
