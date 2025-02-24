import { getAuthCookie } from '@/auth';
import { getUserHistory } from '@api/user.api';
import { formatDate } from '@control/date.control';
import { SessionStateType } from '@model/session.model';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { USER_HISTORY_TYPE } from '@shared/user/constants';
import { UserHistoryDTO } from 'shared/user/model';
import { Anchor } from '@view/anchor';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';
import { useMemo } from 'react';
import { sessionStateLabels } from 'src/constants/session.constant';

export async function loader({ request }: LoaderFunctionArgs): Promise<UserHistoryDTO[] | null> {
	const token: string | null = await getAuthCookie(request);

	if (!token) {
		return null;
	}

	const items = await getUserHistory().catch((err) => null);

	console.log('User history items:', items);

	return items;
}

export default function UserHistoryPage() {
	// const params = useParams();
	const history = useLoaderData<typeof loader>();

	const historyItems = useMemo(() => {
		return (
			history?.map((item) => {
				const { id, updatedAt, metadata, type, data } = item;

				switch (type) {
					case USER_HISTORY_TYPE.JOIN_SESSION: {
						if (!metadata?.sessionId) {
							return null;
						}

						return (
							<div key={id} className="flex flex-row items-center justify-between gap-4 p-4 bg-gray-100">
								<div className="flex items-center gap-4">
									<Typography>{formatDate(updatedAt ?? new Date(), 'DD/MM/YY')}</Typography>
									{/* <Typography>{item.type}</Typography> */}
									{data?.title != null && <Typography>{data.title}</Typography>}
									{data?.state != null && (
										<Typography>{sessionStateLabels[data.state as SessionStateType]}</Typography>
									)}
								</div>
								<Anchor
									href={`/sessions/${item.metadata.sessionId}`}
									className="flex items-center gap-2"
								>
									<Icon name="ArrowRight" size={20} />
								</Anchor>
							</div>
						);
					}
					default: {
						return null;
					}
				}
			}) || []
		);
	}, [history]);

	return (
		<div className="w-full p-6">
			{history == null ? (
				<div className="h-screen max-h-full flex flex-col items-center justify-center">
					<Icon name="PiggyBank" size={48} className="relative -top-6 animate-bounce" />
					<Typography className="">Loading data</Typography>
				</div>
			) : !historyItems?.length ? (
				<div>No items found</div>
			) : (
				<div className="flex flex-col gap-2 w-full">
					<Typography className="text-lg font-bold">User History</Typography>
					{historyItems}
				</div>
			)}
		</div>
	);
}
