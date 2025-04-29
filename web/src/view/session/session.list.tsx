import { useMemo } from 'react';
import { SessionDTO } from '@model/session.model';
import { SessionPreview } from './session.preview';
import { SessionCreateButton } from './session.create-button';
import { Icon } from '@view/icon';
import { SESSION_TYPE_OPTIONS } from 'src/constants/session.constant';
import { useAuth } from '@state/auth.hook';

export function SessionList({ sessions }: { sessions?: SessionDTO[] }) {
	const { user } = useAuth();
	const availableSessions = useMemo(() => {
		return sessions?.filter((session) => {
			if (user?.id && (user.id === session.ownerId || session.users?.includes(user.id))) {
				return true;
			}

			return !!SESSION_TYPE_OPTIONS.find((option) => option.value === session.type)?.enabled;
		});
	}, [user, sessions]);

	const content = useMemo(() => {
		return availableSessions?.map((item) => {
			return <SessionPreview key={item.id} session={item} />;
		});
	}, [availableSessions]);

	if (!availableSessions?.length) {
		return (
			<div className="mt-[20vh] flex flex-col gap-4 items-center justify-center">
				<div>
					<p className="text-center text-sm text-gray-500">No sessions found.</p>
				</div>
				<div>
					<SessionCreateButton className="w-full flex justify-center items-center gap-2">
						<>
							<Icon name="PlusCircle" />
							<span>Create New Session</span>
						</>
					</SessionCreateButton>
				</div>
			</div>
		);
	}

	return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">{content}</div>;
}
