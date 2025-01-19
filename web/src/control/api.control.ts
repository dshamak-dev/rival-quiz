export class WEB_API {
	static apiUrl?: string = undefined;
	static JWT?: string | null;

	static setEnv(variables: Record<string, any>) {
		this.apiUrl = variables.API_URL;
	}

	static setJWT(token: string | null) {
		this.JWT = token;
	}

	static joinUrl(path: string) {
		return [this.apiUrl?.replace(/$\//, '') || '', 'api', path.replace(/^\//, '')].join('/');
	}

	static getAuthHeaders() {
		const token = this.JWT;

		return {
			Authorization: token ? `Bearer ${token}` : undefined,
		};
	}

	static get<T>(path: string, params?: Record<string, any>): Promise<T> {
		const url = WEB_API.joinUrl(path);

		return fetch(url, {
			credentials: 'include',
			...params,
			headers: {
				...this.getAuthHeaders(),
				...params?.headers,
			},
		})
			.then(validateJSONResponse)
			.catch((err) => {
				return Promise.reject(err);
			});
	}

	static post<T>(path: string, params: Record<string, any>, includeHeaders = false): Promise<T> {
		const url = this.joinUrl(path);
		const token = this.JWT;

		return fetch(url, {
			method: 'POST',
			...params,
			credentials: 'include',
			headers: {
				...this.getAuthHeaders(),
				...params.headers,
			},
		}).then((res) => {
			if (includeHeaders) {
				return res;
			}

			return validateJSONResponse(res);
		});
	}

	static put<T>(path: string, params: Record<string, any>): Promise<T> {
		return this.post(path, {
			...params,
			headers: {
				...params.headers,
			},
			method: 'PUT',
		});
	}

	static patch<T>(path: string, params: Record<string, any>): Promise<T> {
		return this.post(path, {
			...params,
			headers: {
				...params.headers,
			},
			method: 'PATCH',
		});
	}

	static delete<T>(path: string, params?: Record<string, any>): Promise<T> {
		const url = WEB_API.joinUrl(path);

		return fetch(url, {
			method: 'DELETE',
			credentials: 'include',
			...params,
			headers: {
				...this.getAuthHeaders(),
				...params?.headers,
			},
		})
			.then(validateJSONResponse)
			.catch((err) => {
				return Promise.reject(err);
			});
	}
}

export async function waitForMS(delay: number) {
	return new Promise((res) => {
		setTimeout(res, delay);
	});
}

export async function validateJSONResponse(response: Response) {
	const isJSON = response.headers.get('content-type')?.includes('application/json');

	let isServer = true;

	try {
		isServer = window == null;
	} catch (err) {}

	if (response.status === 401) {
		if (isServer) {
			// TODO: redirect to login on server side
			// do nothing
		} else {
			redirectClient('/login');
			return Promise.reject('Unauthorized');
		}
	}

	if (response.status >= 400) {
		try {
			const errorBody: any = isJSON
				? await response.json().then((res) => JSON.parse(res))
				: { message: response.statusText };

			const errorMessage = errorBody['Message'] || errorBody.message;

			return Promise.reject(errorMessage);
		} catch (err) {
			const message: string =
				typeof err === 'object' && err
					? (err as { message: string } | null)?.message || response.statusText
					: (err as string);

			return Promise.reject(message);
		}
	}

	return isJSON ? response.json() : response.body;
}

export function getErrorMessage(error: any): string {
	const type = typeof error;

	switch (type) {
		case 'object': {
			return error ? error.message : '';
		}
		case 'string': {
			return error;
		}
		default: {
			return '';
		}
	}
}

export function getRequestSearchField(request: Request, field: string) {
	const url = new URL(request.url);

	const urlSearchParams = new URLSearchParams(url.search);

	return urlSearchParams.get(field);
}

export function redirectClient(to: string) {
	const current = location.pathname;

	location.pathname = `${to}?continue=${current}`;
}
