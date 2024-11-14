import { logOut, requireAuthCookie } from '@/auth';
import { useUI } from '@control/ui.control';
import { DeviceType } from '@model/ui.model';
import { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { ProfileSidebar } from '@view/profile/profile.sidebar';
import classNames from 'classnames';
import { useMemo } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
	const token: String | null = await requireAuthCookie(request);

	if (!token) {
		throw logOut(request.url);
	}

	return { token };
}

export default function ProfilePage() {
	const { deviceType } = useUI();
	// const params = useParams();
	// const { data, loading, dispatch } = useAPI({ initialState: null, request: (id: string) => fetchProfileById(id) });

	// useEffect(() => {
	// 	dispatch(params.id);
	// }, [params.id]);

	const isMobile = useMemo(() => {
		return deviceType === DeviceType.Mobile;
	}, [deviceType]);

	return (
		<div
			className={classNames('relative w-full h-full overflow-hidden grid gap-2', {
				'grid-cols-[auto_1fr]': deviceType && !isMobile,
			})}
		>
			{!deviceType || isMobile ? null : (
				<div className="sticky top-0">
					<ProfileSidebar />
				</div>
			)}
			<div className={classNames("pt-2 h-full overflow-hidden", {
				'px-4 pb-4': isMobile,
				'px-6 pb-6': !isMobile,
			})}>
				<div className="w-full h-full bg-gray-50 rounded overflow-y-auto">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
