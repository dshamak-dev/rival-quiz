import { DateType, ID } from '@model/api.model';
import { QuestionDTO } from '@model/question.model';
import { SessionBetType, SessionData, SessionDTO, SessionStateType, SessionTypes } from '@model/session.model';

export type SessionModelType = Omit<SessionDTO, 'id' | 'ownerId'>;

export class Session implements SessionModelType {
	id?: ID;
	description?: string;
	state: SessionStateType = SessionStateType.Draft;
	title: string = '';
	ownerId?: ID;
	createdAt: DateType = new Date().toISOString();
	updatedAt?: DateType;
	questions?: QuestionDTO[] = [];
	image?: string = undefined;
	betType?: SessionBetType;
	users?: ID[] = [];
	type?: SessionTypes;
	data?: SessionData;
	hasNextAnswer?: boolean;
	activeQuestionId?: ID;

	get json(): SessionDTO {
		return {
			id: this.id as string,
			description: this.description,
			state: this.state,
			title: this.title,
			ownerId: this.ownerId as ID,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			questions: this.questions || [],
			image: this.image,
			userActions: this.data?.userActions,
			users: this.users,
			type: this.type || this.data?.type,
			allowBids: this.data?.allowBids,
			activeQuestionId: this.data?.activeQuestionId,
			betType: this.data?.betType,
		};
	}

	constructor(data: SessionDTO | undefined) {
		Object.assign(this, data || {});
	}

	getQuestionAt(index: number) {
		return this.json.questions?.[index];
	}

	getActiveQuestion() {
		const json = this.json;

		if (json.activeQuestionId) {
			json.questions?.find((question) => question.id === json.activeQuestionId);
		}

		return json.questions?.find((question) => !question.hasAnswer);
	}

	getActiveQuestionIndex() {
		return this.json.questions?.findIndex((question) => !question.hasAnswer);
	}
}
