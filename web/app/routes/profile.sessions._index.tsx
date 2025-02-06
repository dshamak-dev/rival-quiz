import { findSessions } from '@api/session.api';
import { findUserByToken } from '@api/user.api';
import { useUI } from '@control/ui.control';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useAuth } from '@state/auth.hook';
import { Anchor } from '@view/anchor';
import { Button } from '@view/button/button';
import { DateText } from '@view/date/date.text';
import { Icon } from '@view/icon';
import { MobileSupportPlaceholder } from '@view/page/mobile.support-placeholder';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import {  useMemo } from 'react';
import { sessionStateLabels } from 'src/constants/session.constant';

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await findUserByToken().catch((err) => null);

	if (!user?.id) {
		return null;
	}

	const query = `ownerId=${user?.id}`;

	const sessions = await findSessions(query).catch((err) => null);

	return json(sessions);
}

export default function ProfileSessionListPage() {
	const { isLoggedIn, user } = useAuth();
	const sessions = useLoaderData<typeof loader>();

	const navigate = useNavigate();
	const { deviceType, isMobile } = useUI();
	// const { data, loading, dispatch } = useAPI({
	// 	initialState: undefined,
	// 	request: (query: string) => findSessions(query).catch((err) => null),
	// });

	// useEffect(() => {
	// 	if (!user?.id) {
	// 		return;
	// 	}

	// 	setTimeout(() => dispatch(`ownerId=${user.id}`), 1000);
	// }, [user?.id]);

	const content = useMemo(() => {
		if (!isLoggedIn) {
			return (
				<div className="flex justify-center">
					<Anchor href="/login">
						<Button className="min-w-[120px] text-sm">Log In</Button>
					</Anchor>
				</div>
			);
		}

		if (sessions == null) {
			return (
				<div className="h-full flex flex-col items-center justify-center justify-self-center align-self-center">
					<Icon size={48} name="Grid" className="relative -top-6 animate-bounce" />
					<Typography className="text-center relative -right-2">Loading...</Typography>
				</div>
			);
		}

		if (!sessions?.length) {
			return <Typography>No sessions found</Typography>;
		}

		return (
			<div className="w-full flex flex-col gap-4">
				{sessions.map((session) => {
					return (
						<div
							key={session.id}
							className={classNames(
								'grid gap-2 grid-cols-[1fr_auto] items-center',
								'py-2 px-4 bg-gray-100 border rounded',
								'cursor-pointer hover:bg-gray-200'
							)}
							onClick={() => navigate(`/profile/sessions/${session.id}`)}
						>
							<div className="flex gap-6 items-center">
								<DateText
									date={session.updatedAt ?? session.createdAt}
									className="text-sm text-gray-500 min-w-[80px]"
								/>
								<Typography className="min-w-[30%]">{session.title}</Typography>
								<div className="flex gap-12 items-center text-gray-500">
									<Typography className="min-w-[80px] text-sm">
										{sessionStateLabels[session.state]}
									</Typography>
								</div>
							</div>
							<div>
								<Icon name="ThreeDotsVertical" />
							</div>
						</div>
					);
				})}
				<Anchor
					href="/sessions/create"
					// className={classNames(
					// 	'flex justify-center items-center gap-2',
					// 	'p-2 text-sm text-gray-500 hover:text-sky-600 ',
					// 	'border hover:border-sky-600 cursor-pointer'
					// )}
				>
					<Button
						layout="primary"
						size="small"
						className={classNames('w-full flex justify-center items-center gap-2')}
					>
						<Icon name="PlusCircle" />
						<span>Create New Session</span>
					</Button>
				</Anchor>
			</div>
		);
	}, [isLoggedIn, sessions]);

	return (
		<div className="grid w-full min-h-full p-4">
			{isMobile ? (
				<div className="grid items-center justify-center">
					<MobileSupportPlaceholder />
				</div>
			) : (
				content
			)}
		</div>
	);
}
