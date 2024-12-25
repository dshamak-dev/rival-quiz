import { QuestionDTO } from '@model/question.model';
import { SessionDTO, SessionStateType } from '@model/session.model';
import { Button } from '@view/button/button';
import { Collapse } from '@view/collapse/collapse';
import { Icon } from '@view/icon';
import { QuestionForm } from '@view/question/question.form';
import { Typography } from '@view/typography/typography';

export type SingleQuestionSessionFormProps = {
	session?: SessionDTO;
	loading: boolean;
	onUpdate: (path: string, value: any) => Promise<SessionDTO>;
	onAdd: () => Promise<void>;
	onDelete: (questionId: QuestionDTO['id']) => Promise<void>;
};

export function SingleQuestionSessionForm({ session, loading, onUpdate, onAdd, onDelete }: SingleQuestionSessionFormProps) {
	if (!session) {
		return null;
	}

	const nowTime = Date.now();

	const questionsNum = session.questions?.length || 0;
	const canAddQuestion = questionsNum === 0;
	const canEditQuestion = [SessionStateType.Draft, SessionStateType.Published].includes(session.state);

	return (
		<div className="flex flex-col gap-6 p-4">
			{session.questions?.length ? (
				session.questions.map((question, index) => {
					const createdTime = new Date(question.createdAt).getTime();
					const isOpenDefault = nowTime - createdTime <= 5000;

					return (
						<Collapse
							initialState={isOpenDefault}
							key={question.id}
							title={
								<div className="w-full flex gap-2 justify-between items-center">
									<div className="flex gap-2 items-center">
										<Icon name="QuestionSquareFill" />
										<Typography>{`Question ${index + 1}`}</Typography>
									</div>
								</div>
							}
						>
							<QuestionForm
								initialValue={question}
								disabled={loading || !canEditQuestion}
								onSubmit={(questionData) => onUpdate(`questions.${question.id}`, questionData)}
								onDelete={() => onDelete(question.id)}
							/>
						</Collapse>
					);
				})
			) : (
				<Typography className="text-xs">No questions</Typography>
			)}
			<div>
				<Button
					layout={canAddQuestion ? 'tertiary' : undefined}
					size="small"
					className="flex gap-2 items-center"
					disabled={!canAddQuestion}
					onClick={() => {
						onAdd();
					}}
				>
					<Icon name="PlusCircle" />
					Add question
				</Button>
			</div>
		</div>
	);
}
