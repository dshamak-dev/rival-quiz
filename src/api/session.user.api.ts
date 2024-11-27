import { WEB_API } from '@control/api.control';
import { ID } from '@model/api.model';
import { SessionUserActionPayload, SessionUserActionDTO } from '@model/session.user.model';

const rootPath = `/session-user-actions`;

export async function fetchSessionUserActions(sessionId: ID) {
	return WEB_API.get<SessionUserActionDTO[]>(`${rootPath}/${sessionId}`, {}).then((items) =>
        items?.map(normalizeSessionUserActionDTO)
    );
}

export async function postSessionUserAction(payload: SessionUserActionPayload) {
	return WEB_API.post<SessionUserActionDTO>(`${rootPath}`, {
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	}).then((res) => normalizeSessionUserActionDTO(res));
}

function normalizeSessionUserActionDTO(dto: SessionUserActionDTO) {
	return dto;
}
