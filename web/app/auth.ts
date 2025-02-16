import { WEB_API } from '@control/api.control';
import { createCookie, json, redirect } from '@remix-run/node';

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === 'production';
const isSecure = !!process.env.SECURE;

// const secret = process.env.COOKIE_SECRET || 'default';
const secInDay = 60 * 60 * 24;

export const authCookie = createCookie('authToken', {
	// httpOnly: true,
	// path: "/",
	sameSite: 'lax',
	secure: isProd && isSecure,
	// secrets: [secret],
	maxAge: secInDay * 5, //sec * min * hour * days
});

// const { getSession, commitSession, destroySession } =
//   createCookieSessionStorage({
//     cookie: {
//       name: "authToken",
//     //   httpOnly: true,
//     //   maxAge: 60,
//     //   path: "/",
//     //   sameSite: "lax",
//     //   secrets: ["s3cret1"],
//     //   secure: true,
//     },
//   });

// export { getSession, commitSession, destroySession };

export async function getCookie(req: Request) {
	const cookieString = req.headers.get('Cookie');

	return cookieString;
}

export async function getAuthCookie(req: Request) {
	const cookieString = req.headers.get('Cookie');

	const userId = await authCookie.parse(cookieString);

	return userId;
}

export async function authProtectedRoute(req: Request) {
	const cookie = await getAuthCookie(req);

	if (!cookie) {
		throw await logOut(getContinueUrl(req));
	}

	return json({ ok: true, message: 'Authenticated' }, { status: 200 });
}

export async function requireAuthCookie(req: Request) {
	const cookie = await getAuthCookie(req);
	const url = req.url;

	if (!cookie) {
		throw await logOut(getContinueUrl(req));
	}

	return cookie;
}

export function getContinueUrl(req: Request) {
	if (req?.url) {
		return new URL(req.url)?.pathname || '/';
	}

	return '/';
}

export async function logOut(fromUrl: string | null) {
	WEB_API.setJWT(null);

	// `/login${fromUrl ? `?continue=${fromUrl}` : ''}`

	return redirect(`/login?continue=${fromUrl || '/'}`, {
		headers: {
			'Set-Cookie': await authCookie.serialize('', {
				maxAge: 0,
			}),
		},
	});
}
