import { QuestionDTO } from '@model/question.model';
import { SessionDTO } from '@model/session.model';

export function validateSessionGeneral(session: SessionDTO): { isValid: boolean; error?: string } {
	if (!session.id || !session.title) {
		return { isValid: false, error: 'Session title is required' };
	}

	return { isValid: true };
}

export function validateSessionQuestions(session: SessionDTO): { isValid: boolean; error?: string } {
	if (!session?.questions?.length) {
		return { isValid: false, error: 'Session questions are required' };
	}

	const isValid = !session.questions.some(
		(question) => !question.title || !question.options?.length || question.options.length < 2
	);

	return { isValid, error: isValid ? undefined : 'Session questions are not valid' };
}

export function validateQuestion(question: QuestionDTO): { isValid: boolean; error?: string } {
	if (!question.title) {
		return { isValid: false, error: 'Question title required' };
	}

	if (!question.options?.length || question.options.length < 2) {
		return { isValid: false, error: 'At least 2 options required' };
	}

	return { isValid: true };
}
