import { DateType, ID } from '@model/api.model';
import { QuestionDTO } from '@model/question.model';
import { SessionBetType, SessionData, SessionDTO, SessionStateType } from '@model/session.model';

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
	data?: SessionData;
	hasNextAnswer?: boolean;

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
			type: this.data?.type,
			allowBids: this.data?.allowBids,
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
		return this.json.questions?.find((question) => !question.hasAnswer);
	}

	getActiveQuestionIndex() {
		return this.json.questions?.findIndex((question) => !question.hasAnswer);
	}
}
