import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	if (url.pathname === '/') {
		return redirect('/explore');
	}

	return null;
}

export default function RootPage() {
	return <Outlet />;
}
