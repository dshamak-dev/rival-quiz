import { useAPI } from '@api/api.hook';
import { createSession } from '@api/session.api';
import { validateUserPermissions } from '@control/user.control';
import { USER_ROLE_TYPE } from '@model/user.role';
import { useNavigate } from '@remix-run/react';
import { useAuth } from '@state/auth.hook';
import { usePermissions } from '@state/permissions.hook';
import { Button } from '@view/button/button';
import { Icon } from '@view/icon';
import classNames from 'classnames';
import { ReactNode } from 'react';
import { PERMISSION_TYPE } from 'src/constants/permission.constants';

type SessionCreateButtonProps = { className?: string; children?: ReactNode; onSubmit?: () => void };

export function SessionCreateButton({ className, children, onSubmit }: SessionCreateButtonProps) {
	const can = usePermissions();
	const navigate = useNavigate();
	const { loading, dispatch } = useAPI({ request: () => createSession({}) });

	const handleCreateSession = () => {
		dispatch()
			.then((session) => {
				// Handle session created
				console.log('Session created:', session);
				// Redirect to session page
				navigate(`/profile/sessions/${session.id}`);
				onSubmit?.();
			})
			.catch((error) => {});
	};

	if (!can(PERMISSION_TYPE.CREATE_SESSION)) {
		return null;
	}

	return (
		<Button
			layout="primary"
			onClick={handleCreateSession}
			disabled={loading}
			className={classNames(className, 'flex justify-center')}
		>
			{loading ? (
				<Icon name="ArrowClockwise" size={18} className="animate-spin" />
			) : (
				children ?? 'Create New Session'
			)}
		</Button>
	);
}
