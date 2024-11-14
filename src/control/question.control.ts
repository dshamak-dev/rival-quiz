import { QuestionDTO } from '@model/question.model';

export function normalizeQuesionDTO({ _id, ...other }: QuestionDTO) {
	return { ...other, id: _id || other.id };
}
