import { useContext, useMemo } from 'react';
import { AppContext } from '@state/app.state';
import { useLocation, useSubmit } from '@remix-run/react';
import { SUPER_ADMIN_ROLE } from '@model/user.role';

export function useAuth() {
	const state = useContext(AppContext);
	const location = useLocation();
	const handleSubmit = useSubmit();

	const logOut = () => {
		const path = location.pathname;

		handleSubmit({ from: path }, { method: 'post', action: '/logout', replace: true });
	};

	const isLoggedIn = useMemo(() => {
		return !!state.user;
	}, [state?.user]);

	const isRootUser = useMemo(() => {
		if (!state?.user?.roles) {
			return false;
		}

		return state.user.roles.includes(SUPER_ADMIN_ROLE.id);
	}, [state?.user]);

	return { user: state?.user, isLoggedIn, isRootUser, logOut };
}
