import { useMemo } from 'react';
import { Icon } from '@view/icon';
import { Anchor } from '@view/anchor';
import { Typography } from '@view/typography/typography';
import { SessionDTO, SessionStateType } from '@model/session.model';
import { sessionStateLabels } from 'src/constants/session.constant';
import { Button } from '@view/button/button';
import { useAuth } from '@state/auth.hook';
import { SUPER_ADMIN_ROLE } from '@model/user.role';
import { Image } from '@view/image/image';

import placeholderImage from '@assets/placeholders/p_01.png';

export type SessionPreviewProps = {
	session: SessionDTO;
};

export function SessionPreview({ session }: SessionPreviewProps) {
	const { user } = useAuth();

	const canEdit = useMemo(() => {
		if (!user) {
			return false;
		}

		return user.role === SUPER_ADMIN_ROLE.id || user.id === session.ownerId;
	}, [user, session]);

	const controlContent = useMemo(() => {
		// Check if user is in the session
		if (session.data?.isAvalable || session.state === SessionStateType.Published) {
			return (
				<Anchor href={`/sessions/${session.id}`}>
					<Button layout="primary" className="w-full flex items-center gap-2 justify-center">
						<span className="text-sm">Open</span>
						<Icon name="ArrowRight" size={14} className="" />
					</Button>
				</Anchor>
			);
		}

		if (!user) {
			return (
				<Anchor href={`/login`}>
					<Button layout="tertiary" className="w-full flex items-center gap-2 justify-center">
						<span className="text-sm">Login</span>
						<Icon name="DoorClosed" size={14} className="" />
					</Button>
				</Anchor>
			);
		}

		switch (session.state) {
			case SessionStateType.Draft:
				return (
					<Button className="w-full flex items-center gap-2 justify-center">
						<span className="text-sm">Notify Me</span>
						<Icon name="Bell" size={14} />
					</Button>
				);
			default:
				return (
					<Anchor href={`/sessions/${session.id}`}>
						<Button className="w-full flex items-center gap-2 justify-center">
							<span className="text-sm">View Results</span>
							<Icon name="ArrowRight" size={14} className="" />
						</Button>
					</Anchor>
				);
		}
	}, [session?.state]);

	return (
		<div
			key={session.id}
			className="relative grid grid-rows-[1fr_42px] min-h-[200px] gap-4 py-4 px-6 rounded border"
		>
			{canEdit && (
				<div className="absolute right-2 top-1">
					<Anchor
						href={`/profile/sessions/${session.id}`}
						className="flex items-center justify-center w-6 h-6 border rounded-full bg-black text-white hover:bg-amber-600"
					>
						<Icon name="Pencil" size={12} />
					</Anchor>
				</div>
			)}
			<Typography className="absolute left-2 top-2 text-white py-1 px-2 rounded bg-black text-xs ">{sessionStateLabels[session.state]}</Typography>
			<div className="flex flex-col gap-2 justify-between text-center">
				<Image className="h-[160px] object-cover" src={session.image} placeholderImage={placeholderImage} />
				<Typography className="text-4xl font-bold text-center">{session.title}</Typography>
			</div>
			<div className="grid items-end">{controlContent}</div>
		</div>
	);
}
