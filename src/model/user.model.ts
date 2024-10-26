import { ID } from "./api.model";

export type UserDTO = {
	id: ID;
};

export type AuthDTO = {
	user: UserDTO;
	token?: string;
};