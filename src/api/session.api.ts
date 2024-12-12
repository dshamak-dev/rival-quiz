import { WEB_API } from '@control/api.control';
import { normalizeQuesionDTO } from '@control/question.control';
import { QuestionDTO } from '@model/question.model';
import { SessionDTO, SessionStateType } from '@model/session.model';

const rootPath = '/sessions';

export async function findSessions(query: string | null = null): Promise<SessionDTO[]> {
	return WEB_API.get<SessionDTO[]>(`${rootPath}${query ? `?${query}` : ''}`, {}).then((items) =>
		items?.map(normalizeSessionDTO)
		// .filter((it) => {
		// 	// TODO: show user linked sessions
		// 	return [SessionStateType.Published].includes(it.state);
		// })
	);
}

export async function findSessionById(id: SessionDTO['id']): Promise<SessionDTO> {
	return WEB_API.get<SessionDTO>(`${rootPath}/${id}`, {}).then((it) => normalizeSessionDTO(it));
}

export async function deleteSession(id: SessionDTO['id']): Promise<SessionDTO> {
	return WEB_API.delete<SessionDTO>(`${rootPath}/${id}`, {});
}

export async function createSession(payload: any): Promise<SessionDTO> {
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

export function normalizeSessionDTO(dto: SessionDTO) {
	return {
		...dto,
		id: dto._id,
		questions: dto.questions ? dto.questions.map(normalizeQuesionDTO) : [],
	};
}
