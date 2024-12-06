import { WEB_API } from '@control/api.control';
import { ID } from '@model/api.model';
import { SessionDTO } from '@model/session.model';
import { SessionUserActionPayload, SessionUserActionDTO , SessionUserDTO} from '@model/session.user.model';

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

export async function getSessionUsers(sessionId: SessionDTO['id']) {
	return WEB_API.get<SessionUserDTO[]>(`${rootPath}/${sessionId}/users`, {}).then((items) =>
		items?.map(normalizeSessionUserDTO)
	);
}

function normalizeSessionUserActionDTO(dto: SessionUserActionDTO) {
	return dto;
}

function normalizeSessionUserDTO(dto: SessionUserDTO) {
	return dto;
}
