// import { Typography } from '@view/typography/typography';

// import { Image } from '@view/image/image';
import { findSessions } from '@api/session.api';
import { SessionList } from '@view/session/session.list';
import classNames from 'classnames';
import { useUI } from '@control/ui.control';
import { SessionDTO, SessionStateType } from '@model/session.model';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { EventsSlider } from 'src/event/view/event.slider';
import { fetchHighlightEvents } from 'src/event/api/event.api';
import { useCallback } from 'react';
import { useTimeout } from 'src/hooks/time.hook';
import { findUserByToken } from '@api/user.api';

export async function loader({ request }: LoaderFunctionArgs): Promise<{ sessions: SessionDTO[]; events: any }> {
	const user = await findUserByToken(request);

	const sessions = await findSessions(
		`state=${[
			SessionStateType.Active,
			SessionStateType.Published,
			SessionStateType.Locked,
			SessionStateType.LockedForReview,
		]}`
	)
		.then((sessions) =>
			sessions
				?.filter((item) => {
					switch (item.state) {
						case SessionStateType.Active:
						case SessionStateType.Locked:
						case SessionStateType.LockedForReview: {
							if (!user?.id) {
								return false;
							}

							return user.id === item.ownerId || item.users?.includes(user.id);
						}
						default:
							return true;
					}
				})
				?.sort((a, b) => {
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				})
		)
		.catch(() => undefined);

	const events = await fetchHighlightEvents();

	return { sessions: sessions || [], events: events };
}

export default function LandingPage() {
	const { isMobile } = useUI();
	const { sessions, events } = useLoaderData<typeof loader>();
	const revalidator = useRevalidator();

	const refetch = useCallback(
		() => {
			revalidator.revalidate();
		},
		[revalidator] as const
	);

	const timeout = useTimeout(refetch, 60 * 1000);

	return (
		<div
			className={classNames('min-h-full p-6 flex flex-col gap-6', {
				// 'h-full overflow-y-auto': isMobile,
				'h-fit': !isMobile,
			})}
		>
			<EventsSlider items={events} />
			<SessionList sessions={(sessions || []) as SessionDTO[]} />
		</div>
	);
}
