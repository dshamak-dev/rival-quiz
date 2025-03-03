export async function expandResponse<T>(
  request: Promise<T>
): Promise<[T | null, any]> {
  return request
    .then((res): [T | null, any] => [res, null])
    .catch((err) => [null, err]);
}
