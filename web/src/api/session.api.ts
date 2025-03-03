import { WEB_API } from '@control/api.control';
import { normalizeQuesionDTO } from '@control/question.control';
import { QuestionDTO } from '@model/question.model';
import { SessionAnswerPayload, SessionDTO } from '@model/session.model';

const rootPath = '/sessions';

export async function findSessions(query: string | null = null, props = undefined): Promise<SessionDTO[]> {
	return WEB_API.get<SessionDTO[]>(`${rootPath}${query ? `?${query}` : ''}`, props).then((items) =>
		items?.map(normalizeSessionDTO)
	);
}

export async function findSessionById(id: SessionDTO['id'], params = {}): Promise<SessionDTO> {
	return WEB_API.get<SessionDTO>(`${rootPath}/${id}`, params).then((it) => normalizeSessionDTO(it));
}

export async function findSessionByHash(hash: SessionDTO['hash'], params = {}): Promise<SessionDTO> {
	return WEB_API.get<SessionDTO>(`${rootPath}/${hash}`, params).then((it) => normalizeSessionDTO(it));
}

// Note: Validate owner with the current user
export async function findAdminSessionById(id: SessionDTO['id']): Promise<SessionDTO> {
	return WEB_API.get<SessionDTO>(`${rootPath}/${id}`, {}).then((it) => normalizeSessionDTO(it));
}

export async function deleteSession(id: SessionDTO['id']): Promise<SessionDTO> {
	return WEB_API.delete<SessionDTO>(`${rootPath}/${id}`, {});
}

export async function createSession(payload: Object): Promise<SessionDTO> {
	return WEB_API.post<SessionDTO>(`${rootPath}`, {
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	}).then((res) => normalizeSessionDTO(res));
}

export async function patchSession(id: SessionDTO['id'], payload: any): Promise<SessionDTO> {
	return WEB_API.patch<SessionDTO>(`${rootPath}/${id}`, {
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	}).then((res) => normalizeSessionDTO(res));
}

export async function postSessionQuestion(id: SessionDTO['id'], payload: any): Promise<QuestionDTO> {
	return WEB_API.post<QuestionDTO>(`${rootPath}/${id}/questions`, {
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload || {}),
	}).then(normalizeQuesionDTO);
}

export async function deleteSessionQuestion(id: SessionDTO['id'], questionId: QuestionDTO['id']): Promise<SessionDTO> {
	if (!id || !questionId) {
		return Promise.reject('Invalid request props.');
	}

	return WEB_API.delete<SessionDTO>(`${rootPath}/${id}/questions/${questionId}`, {});
}

export async function addSessionUser(sessionId: SessionDTO['id']): Promise<SessionDTO> {
	return WEB_API.post<SessionDTO>(`${rootPath}/${sessionId}/users`, {}).then((res) => normalizeSessionDTO(res));
}

export async function removeSessionUser(sessionId: SessionDTO['id']): Promise<SessionDTO> {
	return WEB_API.delete<SessionDTO>(`${rootPath}/${sessionId}/user`, {}).then((res) => normalizeSessionDTO(res));
}

export async function postSessionQuestionAnswer(
	sessionId: SessionDTO['id'],
	payload: SessionAnswerPayload
): Promise<SessionDTO> {
	return WEB_API.post<SessionDTO>(`${rootPath}/${sessionId}/answer`, {
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload || {}),
	}).then((res) => normalizeSessionDTO(res));
}

export async function resolveSession(sessionId: SessionDTO['id']): Promise<SessionDTO> {
	return WEB_API.post<SessionDTO>(`${rootPath}/${sessionId}/resolve`, {}).then((res) => normalizeSessionDTO(res));
}

export function normalizeSessionDTO(dto: SessionDTO): SessionDTO {
	return {
		...dto,
		questions: dto.questions ? dto.questions.map(normalizeQuesionDTO) : [],
		data: dto.data,
	};
}
