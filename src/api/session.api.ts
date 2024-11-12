import { WEB_API } from '@control/api.control';
import { SessionDTO } from '@model/session.model';

const rootPath = '/sessions';

export async function findSessions(query: string | null = null): Promise<SessionDTO[]> {
	return WEB_API.get<SessionDTO[]>(`${rootPath}${query ? `?${query}` : ''}`, {}).then((items) =>
		items?.map(normalizeSessionDTO)
	);
}

export async function findSessionById(id: SessionDTO['id']): Promise<SessionDTO> {
	return WEB_API.get<SessionDTO>(`${rootPath}/${id}`, {}).then((it) => normalizeSessionDTO(it));
}

export async function createSession(payload: any): Promise<SessionDTO> {
	return WEB_API.post<SessionDTO>(`${rootPath}`, {
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	}).then((res) => normalizeSessionDTO(res));
}

export function normalizeSessionDTO(dto: SessionDTO) {
	return {
		...dto,
		id: dto._id,
	};
}
