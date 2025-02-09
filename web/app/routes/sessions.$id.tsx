// import { useAPI } from '@api/api.hook';
import { findSessionById } from '@api/session.api';
import { SessionDTO } from '@model/session.model';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { Icon } from '@view/icon';
import { SessionView } from '@view/session/view/session.view';
import { Typography } from '@view/typography/typography';
import { Suspense } from 'react';

export async function loader({ params }: LoaderFunctionArgs) {
	const id = params?.id;

	if (!id) {
		return null;
	}

	const session = await findSessionById(id).catch((err) => null);

	return json(session);
}

export default function SessionPage() {
	// const params = useParams();
	const session = useLoaderData<typeof loader>();
	// const { data, loading, dispatch } = useAPI({ initialState: null, request: (id: string) => findSessionById(id) });

	// useEffect(() => {
	// 	dispatch(params.id);
	// }, [params.id]);

	return (
		<div className="w-full p-6 flex justify-center">
			{session == null ? (
				<div className="h-screen max-h-full flex flex-col items-center justify-center">
					<Icon name="PiggyBank" size={48} className="relative -top-6 animate-bounce" />
					<Typography className="">Loading data</Typography>
				</div>
			) : (
				<Suspense fallback={<div>Session is loading...</div>}>
					<SessionView session={session as SessionDTO} />
				</Suspense>
			)}
		</div>
	);
}
