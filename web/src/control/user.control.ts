import { UserDTO } from '@model/user.model';
import { USER_ROLE_TYPE } from '@model/user.role';

export function validateUserPermissions(user: UserDTO | null, requiredPermissions: USER_ROLE_TYPE[]): boolean {
	if (!user?.role) {
		return false;
	}

	if (user.role === USER_ROLE_TYPE.SUPER_ADMIN) {
		return true;
	}

	return requiredPermissions.includes(user.role);
}
