// import { pushStoreItem } from "@control/storage.control";
import { WEB_API } from '@control/api.control';
import { ID } from '@model/api.model';
import { UserDTO } from '@model/user.model';

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
	const user = {...payload };

	if (!user.id && user._id){
		user.id = user._id;
	}

	return user;
}
