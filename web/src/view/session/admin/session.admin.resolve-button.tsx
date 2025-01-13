import { useAPI } from '@api/api.hook';
import { resolveSession } from '@api/session.api';
import { SessionDTO } from '@model/session.model';
import { Button, ButtonProps } from '@view/button/button';
import { useMemo } from 'react';

export function SessionAdminResolveButton({
	session,
	buttonProps,
}: {
	session: SessionDTO;
	buttonProps?: ButtonProps;
}) {
	const { loading, dispatch } = useAPI({ request: (sessionId: SessionDTO['id']) => resolveSession(sessionId) });
	const sessionId = session?.id;

	const handleSubmit = async (): Promise<void> => {
		dispatch(sessionId).catch((err) => {
			console.error(err);
		});
	};

	const text = useMemo(() => {
		if (session.hasNextAnswer) {
			return 'Start Next Question';
		}

		return 'End Session';
	}, [session?.hasNextAnswer]);

	return (
		<Button {...buttonProps} layout="primary" loading={loading} onClick={handleSubmit}>
			{text}
		</Button>
	);
}
