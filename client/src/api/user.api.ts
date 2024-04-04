import { GET } from "src/support/request.utils";

export async function signIn() {
  return GET("/api/auth", {
    headers: {
      "Cache-Control": "no-cache",
    },
    credentials: "include",
  }).then(async (res) => {
    if (res.status === 301) {
      return { user: null, authUrl: await res.text() };
    }

    return res.json();
  });
}

export async function signOut() {
  return GET("/api/auth", {
    method: "DELETE",
    credentials: "include",
  });
}
