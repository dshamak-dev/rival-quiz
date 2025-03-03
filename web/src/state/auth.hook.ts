import { useContext, useMemo } from 'react';
import { AppContext, AppState } from '@state/app.state';
import { useLocation, useSubmit } from '@remix-run/react';
import { USER_ROLE_TYPE } from '@model/user.role';
import { useAPI } from '@api/api.hook';
import { postUserRoleRequest } from '@api/user.api';
import { UserDTO } from '@model/user.model';

export function useAuth() {
	const { dispatch, user, wallet } = useContext(AppContext);
	const { loading, dispatch: dispatchRole } = useAPI({
		request: (role: USER_ROLE_TYPE) => postUserRoleRequest(role),
		initialState: null,
	});
	const location = useLocation();
	const handleSubmit = useSubmit();

	const processing = useMemo(() => {
		return loading;
	}, [loading]);

	const logOut = () => {
		const path = location.pathname;

		handleSubmit({ from: path }, { method: 'post', action: '/logout', replace: true });
	};

	const requestRoleUpdate = (role: USER_ROLE_TYPE) => {
		dispatchRole(role).then((res) => {
			if (dispatch) {
				dispatch((current: AppState) => {
					return { ...current, user: { ...current?.user, ...res } };
				});
			}
		});
	};

	const setUser = (user: UserDTO) => {
		if (dispatch) {
            dispatch((current: AppState) => {
                return {...current, user };
            });
        }
    };

	const isLoggedIn = useMemo(() => {
		return !!user;
	}, [user]);

	return { user, wallet, processing, isLoggedIn, logOut, requestRoleUpdate, setUser };
}
