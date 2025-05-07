import { QuestionDTO } from '@model/question.model';
import { Session } from '@model/session';
import { SessionDTO, SessionStateType } from '@model/session.model';
import { Button } from '@view/button/button';
import { Collapse } from '@view/collapse/collapse';
import { Icon } from '@view/icon';
import { QuestionForm } from '@view/question/question.form';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { validateQuestion, validateSessionQuestions } from 'src/session/helpers';

export type SingleQuestionSessionFormProps = {
	session?: SessionDTO;
	loading: boolean;
	onUpdate: (path: string, value: any) => Promise<SessionDTO>;
	onAdd: () => Promise<void>;
	onDelete: (questionId: QuestionDTO['id']) => Promise<void>;
};

export function SingleQuestionSessionForm({
	session,
	loading,
	onUpdate,
	onAdd,
	onDelete,
}: SingleQuestionSessionFormProps) {
	if (!session) {
		return null;
	}

	const sessionModel = new Session(session);
	const nowTime = Date.now();

	// const questionsNum = session.questions?.length || 0;
	const canEditQuestion = [SessionStateType.Draft, SessionStateType.Published].includes(session.state);
	const activeQuestion = sessionModel.getActiveQuestion() || null;

	const showAddQuestionButton = [SessionStateType.Draft].includes(session?.state);

	const isAllQuestionsValid = !session.questions?.length || validateSessionQuestions(session)?.isValid;
	const canAddQuestion =
		showAddQuestionButton && isAllQuestionsValid && [SessionStateType.Draft].includes(session?.state);

	return (
		<div className="flex flex-col gap-6 p-4">
			{session.questions?.length ? (
				session.questions.map((question, index) => {
					const createdTime = new Date(question.createdAt).getTime();
					const { isValid } = validateQuestion(question);
					const isOpenDefault = nowTime - createdTime <= 5000 || !isValid;
					const isActive = activeQuestion?.id === question.id;
					const isAnswerd = question.hasAnswer;

					return (
						<Collapse
							initialState={isOpenDefault}
							key={question.id}
							title={
								<div className="w-full flex gap-2 justify-between items-center">
									<div
										className={classNames('flex gap-2 items-center', {
											'text-gray-600': !isActive,
										})}
									>
										<Icon name={isActive ? 'QuestionSquareFill' : 'QuestionSquare'} />
										<Typography
											className={classNames({
												'line-through': isAnswerd,
											})}
										>
											{`Question ${index + 1}`}
											{isActive ? ' (ACTIVE)' : null}
										</Typography>
									</div>
								</div>
							}
						>
							<QuestionForm
								sessionId={session.id}
								active={isActive}
								initialValue={question}
								disabled={loading || !canEditQuestion}
								onSubmit={
									canEditQuestion
										? (questionData) => onUpdate(`questions.${question.id}`, questionData)
										: undefined
								}
								onDelete={() => onDelete(question.id)}
								minOptions={2}
							/>
						</Collapse>
					);
				})
			) : (
				<Typography className="text-xs">No questions</Typography>
			)}
			{showAddQuestionButton && (
				<div>
					<Button
						layout={canAddQuestion ? 'tertiary' : undefined}
						size="small"
						className="flex gap-2 items-center"
						disabled={!canAddQuestion}
						errorProps={{
							style: { left: 0 },
						}}
						error={isAllQuestionsValid ? undefined : 'Finish editing questions before adding a new one.'}
						onClick={() => {
							onAdd();
						}}
					>
						<Icon name="PlusCircle" />
						Add question
					</Button>
				</div>
			)}
		</div>
	);
}
