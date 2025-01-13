import { WEB_API } from '@control/api.control';
import { ID } from '@model/api.model';
import { QuestionDataActionEnum, QuestionDTO } from '@model/question.model';

const rootPath = '/question-datas';

export type RequestQestionSyncProps = {
	questionId: ID;
	sessionId: ID;
};

export async function requestQuestionSync(props: RequestQestionSyncProps) {
	return WEB_API.patch<QuestionDTO>(`${rootPath}`, {
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			path: props,
			type: QuestionDataActionEnum.SYNC,
		}),
	});
}
