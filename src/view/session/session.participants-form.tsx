import { useAPI } from '@api/api.hook';
import { getSessionUsers } from '@api/session.user.api';
import { Session, SessionDTO } from '@model/session.model';
import { SessionUserDTO } from '@model/session.user.model';
import { Button } from '@view/button/button';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { useEffect } from 'react';

export type SessionparticipantsFormProps = {
	session?: Session;
	loading: boolean;
	onUpdate: (path: string, value: any) => Promise<SessionDTO>;
};

export function SessionparticipantsForm({ session, loading, onUpdate }: SessionparticipantsFormProps) {
	const {
		loading: isLoadingUsers,
		data: users,
		dispatch: fetchUsers,
	} = useAPI({
		initialState: [],
		request: async (id: SessionDTO['id']) => {
			return (
				session?.users?.map((userId) => {
					return {
						userId,
						name: 'User not found',
					};
				}) || []
			);

			return getSessionUsers(id);
		},
	});

	useEffect(() => {
		if (session?.id && session.users?.length) {
			fetchUsers(session.id);
		}
	}, [session?.id]);

	if (!session || !session?.users?.length) {
		return (
			<div className="p-4">
				<Typography className="text-xs">No participants</Typography>
			</div>
		);
	}

	if (loading || isLoadingUsers) {
		return (
			<div className="h-full flex flex-col items-center justify-center justify-self-center align-self-center">
				<Icon size={48} name="People" className="relative -top-6 animate-bounce" />
				<Typography className="text-center relative -right-2">Loading...</Typography>
			</div>
		);
	}

	return (
		<div className="flex flex-col p-4">
			{users?.map((user, index) => (
				<Participant
					key={user.userId}
					user={user as SessionUserDTO}
					className={classNames({
						'border-t': index !== 0,
					})}
				/>
			))}
		</div>
	);
}

function Participant({ user, className }: { user: SessionUserDTO; className: string }) {
	return (
		<div className={classNames('grid grid-cols-[1fr_auto] gap-2 items-center w-full items-center py-3', className)}>
			<div className="flex gap-2 items-center">
				<div className="text-white bg-black p-1 rounded-full">
					<Icon name="Person" />
				</div>
				<Typography>{user.name}</Typography>
			</div>
			<div>
				<Button layout="primary" disabled size="small">
					Remove
				</Button>
			</div>
		</div>
	);
}
