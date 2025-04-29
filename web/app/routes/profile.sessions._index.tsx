import { findSessions } from '@api/session.api';
import { findUserByToken } from '@api/user.api';
import { SessionDTO, SessionStateType } from '@model/session.model';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useAuth } from '@state/auth.hook';
import { Anchor } from '@view/anchor';
import { Button } from '@view/button/button';
import { DateText } from '@view/date/date.text';
import { Icon } from '@view/icon';
import { SessionCreateButton } from '@view/session/session.create-button';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { useMemo } from 'react';
import { sessionStateLabels } from 'src/constants/session.constant';

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await findUserByToken(request);

	if (!user?.id) {
		return { session: null };
	}

	const query = `ownerId=${user.id}`;

	const sessions = await findSessions(query)
		.then((items) => {
			return items?.sort(
				(a, b) => new Date(b.updatedAt as any).getTime() - new Date(a.updatedAt as any).getTime()
			);
		})
		.catch((err) => null);

	return json({ sessions });
}

const SESSION_STATE_COLORS: Partial<Record<SessionStateType, string>> = {
	[SessionStateType.Active]: 'bg-amber-100',
	[SessionStateType.Published]: 'bg-cyan-100',
	[SessionStateType.Canceled]: 'bg-red-100',
	[SessionStateType.Archived]: 'bg-red-100',
	[SessionStateType.Locked]: 'bg-amber-100',
	[SessionStateType.LockedForReview]: 'bg-amber-100',
	[SessionStateType.Completed]: 'bg-gray-100',
};

export default function ProfileSessionListPage() {
	const { isLoggedIn } = useAuth();
	const { sessions } = useLoaderData<{ sessions: SessionDTO[] | null }>();

	const navigate = useNavigate();

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
			<div className="w-full h-full grid grid-rows-[1fr_auto] gap-4 overflow-hidden">
				<div className="w-full h-full flex flex-col gap-4 overflow-y-auto">
					{sessions.map((session) => {
						const stateColor: string = SESSION_STATE_COLORS[session.state] || 'bg-gray-100';

						return (
							<div
								key={session.id}
								className={classNames(
									'grid gap-2 grid-cols-[1fr_auto] items-center',
									'py-2 px-4 border rounded',
									stateColor,
									'cursor-pointer hover:bg-gray-200'
								)}
								onClick={() => navigate(`/profile/sessions/${session.id}`)}
							>
								<div className="flex gap-6 items-center">
									<DateText
										date={session.updatedAt ?? session.createdAt}
										className="text-sm text-gray-500 min-w-[80px]"
									/>
									<Typography className="min-w-[30%]">{session.title || 'No title'}</Typography>
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
				</div>
				<SessionCreateButton className="w-full flex justify-center items-center gap-2">
					<>
						<Icon name="PlusCircle" />
						<span>Create New Session</span>
					</>
				</SessionCreateButton>
			</div>
		);
	}, [isLoggedIn, sessions]);

	return <div className="grid w-full h-full p-4 overflow-hidden">{content}</div>;
}
