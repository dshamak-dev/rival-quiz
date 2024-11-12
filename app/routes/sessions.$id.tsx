import { useAPI } from '@api/api.hook';
import { findSessionById } from '@api/session.api';
import { useParams } from '@remix-run/react';
import { Icon } from '@view/icon';
import { SessionView } from '@view/session/session.view';
import { Typography } from '@view/typography/typography';
import { useEffect } from 'react';

export default function SessionPage() {
	const params = useParams();
	const { data, loading, dispatch } = useAPI({ initialState: null, request: (id: string) => findSessionById(id) });

	useEffect(() => {
		dispatch(params.id);
	}, [params.id]);

	return (
		<div className="w-full p-6 flex justify-center">
			{loading || !data ? (
				<div className="h-screen max-h-full flex flex-col items-center justify-center">
					<Icon name="PiggyBank" size={48} className="relative -top-6 animate-bounce" />
					<Typography className="">Loading data</Typography>
				</div>
			) : (
				<SessionView session={data} />
			)}
		</div>
	);
}
