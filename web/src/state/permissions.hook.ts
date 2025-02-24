import { PERMISSION_TYPE } from 'src/constants/permission.constants';
import { useAuth } from './auth.hook';
import { validateUserPermissions } from '@control/user.control';
import { USER_ROLE_TYPE } from '@model/user.role';

export function usePermissions() {
	const { user } = useAuth();

	const can = (permission: PERMISSION_TYPE) => {
		if (!user?.role) {
			return false;
		}

		switch (permission) {
			case PERMISSION_TYPE.CREATE_SESSION:
				return validateUserPermissions(user, [USER_ROLE_TYPE.ADMIN, USER_ROLE_TYPE.CREATOR]);
			default:
				return true;
		}
	};

	return can;
}
