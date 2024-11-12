import { logOut, requireAuthCookie } from '@/auth';
import { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { ProfileSidebar } from '@view/profile/profile.sidebar';

export async function loader({ request }: LoaderFunctionArgs) {
	const token: String | null = await requireAuthCookie(request);

	if (!token) {
		throw logOut(request.url);
	}

	return { token };
}

export default function ProfilePage() {
	// const params = useParams();
	// const { data, loading, dispatch } = useAPI({ initialState: null, request: (id: string) => fetchProfileById(id) });

	// useEffect(() => {
	// 	dispatch(params.id);
	// }, [params.id]);

	return (
		<div className="relative w-full h-full overflow-hidden grid gap-2 grid-cols-[auto_1fr]">
			<div className="sticky top-0">
				<ProfileSidebar />
			</div>
			<div className="px-6 pt-2 pb-6 h-full overflow-hidden">
				<div className="w-full h-full bg-gray-50 rounded overflow-y-auto">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
