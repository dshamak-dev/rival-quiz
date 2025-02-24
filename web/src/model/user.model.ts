import { DateType, ID } from "./api.model";
import { USER_ROLE_TYPE } from "./user.role";

export type UserDTO = {
	id: ID;
	tag?: string;
	role?: USER_ROLE_TYPE;
	name: string;
	email?: string;
	authType?: string;
	meta?: any;
	photoUrl?: string;
	hash?: string;
};

export type AuthDTO = {
	user: UserDTO;
	token?: string;
};
