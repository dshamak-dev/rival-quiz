// import { pushStoreItem } from "@control/storage.control";
import { getErrorMessage, validateJSONResponse, WEB_API } from '@control/api.control';
import { AuthDTO, UserDTO } from '@model/user.model';
import { USER_ROLE_TYPE, UserAuthPayloadDTO } from '@model/user.role';
import { UserHistoryDTO } from '@shared/user/model';
import cookie from 'cookie';

// export async function findMany(): Promise<IUser[]> {
//   return WEB_API.get<IUser[]>("/users/all", {}).then((res) =>
//     res.map((it) => normalizeUserDTO(it))
//   );
// }

export async function findUserByToken() {
	return WEB_API.get<UserDTO>('/users/current', {}).then((it) => normalizeUserDTO(it));
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
export async function getUserHistory() {
	return WEB_API.get<UserHistoryDTO[]>('/users/history', {});
}
