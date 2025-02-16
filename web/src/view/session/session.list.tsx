import { useMemo } from 'react';
import { SessionDTO } from '@model/session.model';
import { SessionPreview } from './session.preview';
import { LinkButton } from '@view/anchor/link.button';
import { SessionCreateButton } from './session.create-button';
import { Icon } from '@view/icon';

export function SessionList({ sessions }: { sessions?: SessionDTO[] }) {
	const content = useMemo(() => {
		return sessions?.map((item) => {
			return <SessionPreview key={item.id} session={item} />;
		});
	}, [sessions]);

	if (!sessions?.length) {
		return (
			<div className="mt-[20vh] flex flex-col gap-4 items-center justify-center">
				<div>
					<p className="text-center text-sm text-gray-500">No sessions found.</p>
					<p className="text-center text-sm text-gray-500">Add a new session to get started.</p>
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
