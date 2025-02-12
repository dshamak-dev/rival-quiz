import { ID } from "./api.model";

export type UserDTO = {
	id: ID;
	_id?: ID;
	role?: ID;
	name: string;
	email?: string;
	authType?: string;
	meta?: any;
};

export type AuthDTO = {
	user: UserDTO;
	token?: string;
};