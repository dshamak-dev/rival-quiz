import { getAuthCookie } from '@/auth';
import { getUserHistory } from '@api/user.api';
import { formatDate } from '@control/date.control';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { UserHistoryDTO } from '@shared/user/model';
import { Anchor } from '@view/anchor';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';

export async function loader({ request }: LoaderFunctionArgs): Promise<UserHistoryDTO[] | null> {
	const token: string | null = await getAuthCookie(request);

	if (!token) {
		return null;
	}

	const items = await getUserHistory().catch((err) => null);

	return items;
}

export default function UserHistoryPage() {
	// const params = useParams();
	const history = useLoaderData<typeof loader>();

	return (
		<div className="w-full p-6">
			{history == null ? (
				<div className="h-screen max-h-full flex flex-col items-center justify-center">
					<Icon name="PiggyBank" size={48} className="relative -top-6 animate-bounce" />
					<Typography className="">Loading data</Typography>
				</div>
			) : !history?.length ? (
				<div>No items found</div>
			) : (
				<div className="flex flex-col gap-2 w-full">
					<Typography className="text-lg font-bold">User History</Typography>
					{history.map((item) => (
						<div key={item.id} className="flex flex-row items-center justify-between gap-4 p-4 bg-gray-100">
							<div className="flex items-center gap-4">
								<Typography>{formatDate(item.updatedAt)}</Typography>
								<Typography>{item.type}</Typography>
							</div>
							{item.data?.sessionId != null && (
								<Anchor href={`/sessions/${item.data.sessionId}`} className="flex items-center gap-2">
									<Icon name="ArrowRight" size={20} />
								</Anchor>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
