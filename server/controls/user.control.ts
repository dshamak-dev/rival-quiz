import fetch from "node-fetch";

const rivalApi = process.env.RIVAL_API;

export async function findUserByCreds(req) {
  const cookie = Object.entries(req.cookies)
    .reduce((accum, [key, value]) => {
      accum.push(`${key}=${value}`);

      return accum;
    }, [] as string[])
    .join(";");

  return fetch(`${rivalApi}/api/users/self`, {
    headers: {
      cookie,
    },
  })
    .then(async (res) => {
      if (res.status >= 400) {
        return [await res.json(), null];
      }

      return [null, await res.json()];
    })
    .catch((error) => {
      return [error, null];
    });
}
