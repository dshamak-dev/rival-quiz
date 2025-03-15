import logo from '@assets/logo.png';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
	return redirect(logo);
}
