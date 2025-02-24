import { ID } from './api.model';

export const SUPER_ADMIN_ROLE: UserRole = {
	id: '0000-0000-0000-0000',
	name: 'Super Admin',
	isFullAccess: true,
};

export type UserRole = {
	id: ID;
	name: string;
	isFullAccess: boolean;
};

export enum USER_ROLE_TYPE {
	SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
	CREATOR = 'CREATOR',
    USER = 'USER',
}

export type UserAuthPayloadDTO =
	| UserEmailAuthPayloadDTO
	| { authType: 'telegram'; id: string; name: string; photoUrl?: string };

export type UserEmailAuthPayloadDTO = { authType: 'email'; email: string; password: string };
