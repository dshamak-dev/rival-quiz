import { createCookie, redirect, createCookieSessionStorage } from "@remix-run/node";

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === "production";
const isSecure = !!process.env.SECURE;

const secret = process.env.COOKIE_SECRET || "default";

export const authCookie = createCookie("authToken", {
  // httpOnly: true,
  // path: "/",
  sameSite: "lax",
  secure: isProd && isSecure,
  // secrets: [secret],
  maxAge: 60 * 60 * 24 * 0.5, //sec * min * hour * days
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

export async function getAuthCookie(req: Request) {
  const cookieString = req.headers.get("Cookie");

  const userId = await authCookie.parse(cookieString);

  return userId;
}

export async function requireAuthCookie(req: Request) {
  const cookie = await getAuthCookie(req);
  const url = req.url;

  if (!cookie) {
    throw await logOut(url);
  }

  return cookie;
}

export async function logOut(fromUrl: string | null) {
  return redirect(`/login${fromUrl ? `?continue=${fromUrl}` : ''}`, {
    headers: {
      "Set-Cookie": await authCookie.serialize("", {
        maxAge: 0,
      }),
    },
  });
}
