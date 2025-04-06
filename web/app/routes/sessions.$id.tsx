// import { useAPI } from '@api/api.hook';
import { getAuthHeaders } from '@/auth';
import { findSessionById } from '@api/session.api';
import { SessionDTO } from '@model/session.model';
import { json, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { Icon } from '@view/icon';
import { SessionView } from '@view/session/view/session.view';
import { Typography } from '@view/typography/typography';
// import { Suspense } from 'react';
import { APP_NAME } from 'src/constants/config.constants';
import placeholderImage from '@assets/placeholders/p_01.png';

export async function loader({ request, params }: LoaderFunctionArgs) {
	const headers = await getAuthHeaders(request).catch((err) => null);
	const id = params?.id;

	if (!id) {
		return null;
	}

	const session = await findSessionById(id, { headers }).catch((err) => null);

	return json(session);
}

export const meta: MetaFunction<typeof loader> = ({ params, data }) => {
	if (!data) {
		return [];
	}

	const title = data?.title || APP_NAME;
	const description = data?.description;
	const imageUrl = data?.image || placeholderImage;

	return [
		{ title: title },
		{ name: 'description', content: 'description' },
		{ property: 'og:title', content: title },
		{ property: 'og:description', content: description },
		{ property: 'og:image', content: imageUrl },
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:image', content: imageUrl },
	];
};

export default function SessionPage() {
	// const params = useParams();
	const session = useLoaderData<typeof loader>();

	return (
		<div className="w-full p-6 flex justify-center">
			{session == null ? (
				<div className="h-screen max-h-full flex flex-col items-center justify-center">
					<Icon name="PiggyBank" size={48} className="relative -top-6 animate-bounce" />
					<Typography className="">Loading data</Typography>
				</div>
			) : (
				<SessionView session={session as SessionDTO} />
			)}
		</div>
	);
}
