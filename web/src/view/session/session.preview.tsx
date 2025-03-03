import { useMemo } from 'react';
import { Icon } from '@view/icon';
import { Anchor } from '@view/anchor';
import { Typography } from '@view/typography/typography';
import { SessionDTO, SessionStateType } from '@model/session.model';
import { Button } from '@view/button/button';
import { useAuth } from '@state/auth.hook';
import { Image } from '@view/image/image';

import placeholderImage from '@assets/placeholders/p_01.png';
import { useUI } from '@control/ui.control';
import { Chip } from '@view/chip';
import { sessionTypeLabels } from 'src/constants/session.constant';

export type SessionPreviewProps = {
	session: SessionDTO;
};

export function SessionPreview({ session }: SessionPreviewProps) {
	const { user } = useAuth();
	const { isMobile } = useUI();

	const controlContent = useMemo(() => {
		// Check if user is in the session
		if (session.data?.isAvalable || session.state === SessionStateType.Published) {
			return (
				<Anchor href={`/sessions/${session.hash}`} className="w-full">
					<Button faded={false} className="w-full flex items-center gap-2 justify-center">
						<span className="text-sm">Open</span>
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
					<Anchor href={`/sessions/${session.hash}`}>
						<Button className="w-full flex items-center gap-2 justify-center">
							<span className="text-sm">View Results</span>
							<Icon name="ArrowRight" size={14} className="" />
						</Button>
					</Anchor>
				);
		}
	}, [session?.state]);

	const sessionType = session.type ? sessionTypeLabels[session.type] : null;

	return (
		<Anchor href={`/sessions/${session.hash}`} key={session.id} className="relative rounded overflow-hidden border">
			{sessionType && (
				<div className="absolute z-10 top-0 left-0 p-2">
					<Chip className="uppercase bg-black text-white text-xs">{sessionType}</Chip>
				</div>
			)}
			{!isMobile && (
				<div className="absolute z-20 top-0 left-0 w-full h-full bg-black/55 opacity-0 hover:opacity-100 flex items-center justify-center p-8">
					{controlContent}
				</div>
			)}
			<div className="relative grid grid-rows-[1fr_auto] bg-gray-100">
				<Image
					className="h-[200px] w-full object-cover rounded"
					src={session.image}
					placeholderImage={placeholderImage}
				/>
				<div className="grid grid-cols-[auto_1fr] gap-4 p-4">
					<div>
						<Image
							className="h-12 w-12 object-cover rounded"
							src={session.metadata?.ownerAvatar}
							placeholderImage={placeholderImage}
						/>
					</div>
					<div className="flex flex-col">
						<Typography className="text-4xl font-bold">{session.title}</Typography>
						<Typography className="text-sm ">@{session.metadata?.ownerName || 'incognito'}</Typography>
					</div>
				</div>
			</div>
		</Anchor>
	);
}
