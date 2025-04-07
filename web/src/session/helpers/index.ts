import { SessionDTO } from '@model/session.model';

export function validateSessionGeneral(session: SessionDTO): boolean {
	if (!session.id || !session.title) {
		return false;
	}

	return true;
}

export function validateSessionQuestions(session: SessionDTO): boolean {
	if (!session?.questions?.length) {
		return false;
	}

	return !session.questions.some(
		(question) => !question.title || !question.options?.length || question.options.length < 2
	);
}
