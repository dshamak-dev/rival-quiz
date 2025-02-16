import { useAPI } from '@api/api.hook';
import { createSession } from '@api/session.api';
import { useNavigate } from '@remix-run/react';
import { Button } from '@view/button/button';
import { Icon } from '@view/icon';
import classNames from 'classnames';
import { ReactNode } from 'react';

type SessionCreateButtonProps = { className?: string; children?: ReactNode; onSubmit?: () => void };

export function SessionCreateButton({ className, children, onSubmit }: SessionCreateButtonProps) {
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
