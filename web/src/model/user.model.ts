import { ID } from "./api.model";

export type UserDTO = {
	id: ID;
	_id?: ID;
};

export type AuthDTO = {
	user: UserDTO;
	token?: string;
};