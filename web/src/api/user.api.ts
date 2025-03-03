// import { pushStoreItem } from "@control/storage.control";
import { getAuthCookie } from '@/auth';
import { WEB_API } from '@control/api.control';
import { UserDTO } from '@model/user.model';
import { USER_ROLE_TYPE, UserAuthPayloadDTO } from '@model/user.role';
import { UserHistoryDTO } from '@shared/user/model';

// export async function findMany(): Promise<IUser[]> {
//   return WEB_API.get<IUser[]>("/users/all", {}).then((res) =>
//     res.map((it) => normalizeUserDTO(it))
//   );
// }

export async function findUserByToken(request: Request) {
	const cookie: string | null = await getAuthCookie(request);

	return WEB_API.fetch('users/current', {
		method: 'GET',
		headers: { Cookie: cookie },
		credentials: 'include',
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}

			return null;
		})
		.then((it) => normalizeUserDTO(it))
		.catch((error) => {
			return null;
		});
}

export async function findUserById(id: UserDTO['id']): Promise<UserDTO> {
	return WEB_API.get<UserDTO>(`/users/${id}`, {}).then((it) => normalizeUserDTO(it));
}

export async function postUserRoleRequest(role: USER_ROLE_TYPE) {
	return WEB_API.post<UserDTO>(`/users/current/role-request`, {
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ role }),
	});
}

export function normalizeUserDTO(payload: UserDTO): UserDTO {
	const user = { ...payload };

	// if (!user.id) {
	// 	user.id = user._id;
	// }

	return user;
}

export async function loginUser(payload: UserAuthPayloadDTO) {
	return WEB_API.post<Response>(
		'users/login',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		},
		true
	);
}

export async function signupUser(payload: UserAuthPayloadDTO) {
	// Note: Validate password and confirm passowrd match before sending request

	return WEB_API.post<Response>(
		'users/create',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		},
		true
	);
}

// start region: User History
export async function getUserHistory(params ={}) {
	return WEB_API.get<UserHistoryDTO[]>('/users/history', params);
}
