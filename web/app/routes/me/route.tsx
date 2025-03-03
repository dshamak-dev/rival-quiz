import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request }: LoaderFunctionArgs) {
	const cookie = request.headers.get('Cookie')

	const user = await fetch('http://api-local/users/current', {
		method: 'GET',
		headers: { Cookie: cookie || '' },
		credentials: 'include',
	}).then(response => response.json()).catch(error => {
		console.error('Error:', error);
		return null;
	});

	return user;
}

export default function SetCookiePage() {
	const data = useLoaderData<typeof loader>();


	return <div>{JSON.stringify(data)}</div>;
}
