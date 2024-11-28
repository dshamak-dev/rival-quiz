import { QuestionDTO } from '@model/question.model';
import { Button } from '@view/button/button';
import { Typography } from '@view/typography/typography';
import { useEffect, useMemo, useState } from 'react';
import { SessionViewProps } from './session.view';
import { Select, SelectOption } from '@view/form/form.select';
import { useAPI } from '@api/api.hook';
import { SessionUserActionPayload, SessionUserActionTypes } from '@model/session.user.model';
import { postSessionUserAction, fetchSessionUserActions } from '@api/session.user.api';
import { ID } from '@model/api.model';
import { FormLabel } from '@view/form/form.label';
import { useSession } from '@state/session.state';

export type SessionViewPublishedProps = SessionViewProps;

export function SessionViewPublished() {
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
	}, [selectedAnswer, userData]);

	const questionOptions = useMemo(() => {
		const options: SelectOption[] = [
			{
				label: 'No answer',
				value: '',
				disabled: true,
			},
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

	const handleAnswerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedAnswer = e.target.value;
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
		if (isLoading) {
			return <div>Loading...</div>;
		}

		if (currentAnswer == null) {
			return (
				<>
					<Select
						id="answer"
						className="w-full border px-2 py-2 rounded"
						required
						value={selectedAnswer}
						options={questionOptions}
						onChange={handleAnswerChange}
					/>
					<Button layout="primary" disabled={!canSave} onClick={handleSave}>
						Confirm answer
					</Button>
				</>
			);
		}

		return (
			<>
				<div>
					<FormLabel>Your Answer</FormLabel>
					<Typography size="large" className="text-center">
						{currentAnswer}
					</Typography>
				</div>
				<Button layout="primary" onClick={handleCancelAnswer}>
					Cancel Answer
				</Button>
			</>
		);

		return null;
	}, [currentAnswer, selectedAnswer, isLoading]);

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
