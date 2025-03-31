import { QuestionDataDTO } from "@/question/quistion.model";

export function normalize(dto): QuestionDataDTO {
	return dto?.json;
}
