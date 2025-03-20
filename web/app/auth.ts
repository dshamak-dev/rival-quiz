import { createCookie, json, redirect } from '@remix-run/node';

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === 'production';
const isSecure = !!process.env.SECURE;
const secInDay = 60 * 60 * 24;
const authCookieKey = 'authToken';

export const authCookie = createCookie(authCookieKey, {
	httpOnly: true,
	path: '/',
	sameSite: 'lax',
	secure: isProd && isSecure,
	// secrets: [secret],
	maxAge: secInDay * 7, //sec * min * hour * days
});

type SessionData = {
	authToken: string;
};

type SessionFlashData = {
	error: string;
};

export async function getCookie(req: Request) {
	const cookieString = req.headers.get('Cookie');

	return cookieString;
}

export async function getAuthCookie(request: Request) {
	const cookieString = request.headers.get('Cookie');

	if (!cookieString?.includes(authCookieKey)) {
		// Return null if no auth cookie
		return null;
	}

	return cookieString;
}

export async function getAuthHeaders(request: Request) {
	const cookie: string | null = await getAuthCookie(request);

	if (!cookie){
		return Promise.reject('No cookie found');
	}

	return { Cookie: cookie };
}

export async function authProtectedRoute(req: Request) {
	const cookie = await getAuthCookie(req);

	if (!cookie) {
		throw await logOut(getContinueUrl(req));
	}

	return json({ ok: true, message: 'Authenticated' }, { status: 200 });
}

export async function requireAuthCookie(req: Request) {
	const cookie = await getAuthCookie(req).catch((err) => null);

	if (!cookie) {
		throw await logOut(getContinueUrl(req));
	}

	return cookie;
}

export function getContinueUrl(req: Request) {
	if (req?.url) {
		const { pathname } = new URL(req.url) || { pathname: '/' };

		if (pathname.includes('login')) {
			return '/';
		}

		return pathname;
	}

	return '/';
}

export async function logOut(fromUrl: string | null) {
	return redirect(`/login?continue=${fromUrl || '/'}`, {
		headers: {
			'Set-Cookie': await authCookie.serialize('', {
				maxAge: 0,
			}),
		},
	});
}
