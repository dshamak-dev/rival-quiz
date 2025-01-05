import { useMemo } from 'react';
import { SessionDTO } from '@model/session.model';
import { SessionPreview } from './session.preview';

export function SessionList({ sessions = [] }: { sessions: SessionDTO[] }) {
	const content = useMemo(() => {
		return sessions.map((item) => {
			return <SessionPreview key={item.id} session={item} />;
		});
	}, [sessions]);

	if (!sessions?.length) {
		return <p className="text-center text-sm text-gray-500">No sessions found.</p>;
	}

	return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">{content}</div>;
}
