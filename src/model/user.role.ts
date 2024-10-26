import { ID } from "./api.model";

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