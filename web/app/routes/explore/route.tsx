// import { Typography } from '@view/typography/typography';

// import { Image } from '@view/image/image';
import { findSessions } from '@api/session.api';
import { SessionList } from '@view/session/session.list';
import classNames from 'classnames';
import { useUI } from '@control/ui.control';
import { SessionDTO, SessionStateType } from '@model/session.model';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { EventsSlider } from 'src/event/view/event.slider';
import { fetchHighlightEvents } from 'src/event/api/event.api';

export async function loader({ request }: LoaderFunctionArgs): Promise<{ sessions: SessionDTO[]; events: any }> {
	const sessions = await findSessions(`state=${[SessionStateType.Active, SessionStateType.Published]}`)
		.then((sessions) =>
			sessions?.sort((a, b) => {
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
