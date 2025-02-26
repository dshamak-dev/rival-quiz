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

// export async function deleteOne(id: IUser["id"]): Promise<IUser> {
//   return WEB_API.delete<IUser>(`/users/user?id=${id}`, {});
// }

// export async function updateOne(user: IUser) {
//   return WEB_API.put<IUser>("users/update", {
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(user),
//   });
// }

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
	).then(async (res): Promise<AuthDTO> => {
		return setUserAuth(res);
	});
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
	).then(async (res): Promise<AuthDTO> => {
		return setUserAuth(res);
	});
}

async function setUserAuth(response: Response) {
	if (!response.ok) {
		return validateJSONResponse(response);
	}

	const cookies = response.headers.get('Set-Cookie');
	const cookieEntries = cookies ? cookie.parse(cookies) : null;

	const token = cookieEntries?.authToken;

	if (token) {
		WEB_API.setJWT(token);
	}

	const user = await response.json();

	return Promise.resolve({
		token,
		user,
	});
}

// start region: User History
export async function getUserHistory() {
	return WEB_API.get<UserHistoryDTO[]>('/users/history', {});
}
