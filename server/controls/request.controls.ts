export function parseCookies(req) {
  if (!req.cookies) {
    return null;
  }

  return Object.entries(req.cookies)
    .reduce((accum, [key, value]) => {
      accum.push(`${key}=${value}`);

      return accum;
    }, [])
    .join(";");
}
