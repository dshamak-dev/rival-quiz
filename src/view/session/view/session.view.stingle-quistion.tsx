import { QuestionDTO } from '@model/question.model';
import { Button } from '@view/button/button';
import { Typography } from '@view/typography/typography';
import { useEffect, useMemo, useState } from 'react';
import { SessionViewProps } from './session.view';
import { SelectOption } from '@view/form/form.select';
import { useAPI } from '@api/api.hook';
import { SessionUserActionPayload, SessionUserActionTypes } from '@model/session.user.model';
import { postSessionUserAction, fetchSessionUserActions } from '@api/session.user.api';
import { ID } from '@model/api.model';
import { useSession } from '@state/session.state';
import { SessionStateType } from '@model/session.model';
import { RadioList } from '@view/form/form.radio';

export type SessionViewPublishedProps = SessionViewProps;

export function SessionViewSingleQuestion() {
	const { session, dispatch } = useSession();
	const {
		data: postData,
		loading,
		dispatch: postAction,
	} = useAPI({
		request: (payload: SessionUserActionPayload) => postSessionUserAction(payload),
	});
	const {
		data: userActions,
		loading: loadingUserData,
		dispatch: fetchUserActions,
	} = useAPI({
		initialState: session?.userActions,
		request: (sessionId: ID) => fetchSessionUserActions(sessionId),
	});

	const isLocked = useMemo(() => {
		if (!session?.state) {
			return true;
		}

		return ![SessionStateType.Published].includes(session?.state);
	}, [session?.state]);

	const question: QuestionDTO | null = useMemo(() => {
		return session?.questions?.[0] || null;
	}, [session?.questions]);

	const userData = useMemo(() => {
		return {
			answers: session?.questions?.reduce((accum, it) => {
				const qAction = userActions?.find((it) => it.questionId === it.questionId);

				accum[it.id] = qAction?.data?.value;

				return accum;
			}, {} as { [questionId: string]: string | undefined }),
		};
	}, [session?.questions, userActions]);

	const getQuestionAnswer = (questionId?: string) => {
		if (questionId == null) {
			return;
		}

		return userData?.answers?.[questionId];
	};

	const currentAnswer = useMemo(() => {
		return getQuestionAnswer(question?.id);
	}, [question?.id, userData]);

	const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(currentAnswer);

	useEffect(() => {
		const qAnswer = getQuestionAnswer(question?.id);

		if (qAnswer != null) {
			dispatch?.({ type: 'SET_USER_PROGRESS', payload: 1 });
		} else {
			dispatch?.({ type: 'SET_USER_PROGRESS', payload: 0 });
		}

		if (selectedAnswer != null || qAnswer == null) {
			return;
		}

		setSelectedAnswer(qAnswer);
	}, [userData]);

	const questionOptions = useMemo(() => {
		const options: SelectOption[] = [
			// {
			// 	label: 'No answer',
			// 	value: '',
			// 	disabled: true,
			// },
		];

		if (question?.options?.length) {
			question.options.forEach((it, index) => {
				options.push({
					label: it,
					value: it,
				});
			});
		}

		return options;
	}, [question?.options]);

	const isLoading = useMemo(() => {
		return loading || loadingUserData;
	}, [loading, loadingUserData]);

	const canSave = useMemo(() => {
		// TODO: Implement validation logic based on the question type and options
		// TODO: Check if session require a Bid and if a bid has been placed

		return question?.id && selectedAnswer !== undefined && currentAnswer == null;
	}, [currentAnswer, question, selectedAnswer]);

	const handleSave = () => {
		// TODO: Save the answer to the session
		// TODO: Update the session state to 'Answered'
		// TODO: Update the user's bid if required

		if (!session || !question?.id || !selectedAnswer) {
			return;
		}

		postAction({
			sessionId: session.id,
			questionId: question.id,
			type: SessionUserActionTypes.SUBMIT_ANSWER,
			data: { value: selectedAnswer },
		}).then(() => {
			setSelectedAnswer(undefined);
			fetchUserActions(session.id);
		});
	};

	const handleAnswerChange = (selectedAnswer: any) => {
		// const selectedAnswer = e.target.value;
		setSelectedAnswer(selectedAnswer);
	};

	const handleCancelAnswer = () => {
		if (!session || !question?.id || !currentAnswer) {
			return;
		}

		postAction({
			sessionId: session.id,
			questionId: question.id,
			type: SessionUserActionTypes.REMOVE_ANSWER,
			data: { value: selectedAnswer },
		}).then(() => {
			setSelectedAnswer(undefined);
			fetchUserActions(session.id);
		});
	};

	const content = useMemo(() => {
		if (session?.state == null) {
			return null;
		}

		if (isLoading) {
			return <div>Loading...</div>;
		}

		if (!question) {
			return <div>No question available</div>;
		}

		const answerVariants = (
			<RadioList
				disabled={isLocked || currentAnswer != null}
				items={questionOptions}
				value={selectedAnswer}
				onChange={handleAnswerChange}
			/>
		);

		switch (session.state) {
			case SessionStateType.Published:
				return (
					<>
						{answerVariants}
						{currentAnswer == null ? (
							<Button layout="primary" disabled={!canSave} onClick={handleSave}>
								Confirm answer
							</Button>
						) : (
							<Button layout="primary" onClick={handleCancelAnswer}>
								Cancel answer
							</Button>
						)}
					</>
				);
			case SessionStateType.Locked:
			default: {
				return <>{answerVariants}</>;
			}
		}
	}, [isLocked, currentAnswer, selectedAnswer, isLoading]);

	return (
		<div className="flex flex-col gap-8 items-center">
			<div>
				<Typography className="font-bold text-center text-3xl" size="custom">
					{question?.title}
				</Typography>
				{question?.description && (
					<Typography className="text-xs text-center">{question.description}</Typography>
				)}
			</div>
			{content}
		</div>
	);
}
