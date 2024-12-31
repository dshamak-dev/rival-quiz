import { QuestionDTO } from '@model/question.model';

export function normalizeQuesionDTO({ _id, ...other }: QuestionDTO): QuestionDTO {
	return { ...other, id: other.id };
}
