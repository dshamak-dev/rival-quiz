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
import { ProgressStage, SessionStateType, SessionTypes } from '@model/session.model';
import { RadioList } from '@view/form/form.radio';
import { useAuth } from '@state/auth.hook';
import { SingleQuestionSession } from '@model/session/single-question';
import { Icon } from '@view/icon';
import { LinkButton } from '@view/anchor/link.button';
import { SessionBetInput } from 'src/session/view/session.bet-input';

export type SessionViewPublishedProps = SessionViewProps;

export function SessionViewSingleQuestion() {
	const { session, dispatch, join, leave } = useSession();

	const sessionModel = useMemo(() => {
		return new SingleQuestionSession(session);
	}, [session]);
	const { user, isLoggedIn } = useAuth();
	const {
		data: postData,
		loading,
		dispatch: postAction,
	} = useAPI({
		request: (payload: SessionUserActionPayload) => postSessionUserAction(payload),
	});
	const {
		data: userActionsData,
		loading: loadingUserData,
		dispatch: fetchUserActions,
	} = useAPI({
		initialState: session?.userActions,
		request: (sessionId: ID) => fetchSessionUserActions(sessionId),
	});
	const userActions = userActionsData || session?.userActions;

	const hasJoined = useMemo(() => {
		if (!isLoggedIn || !user) {
			return false;
		}

		return session?.users?.includes(user?.id);
	}, [isLoggedIn, user, session?.users]);

	const canAnswer = useMemo(() => {
		if (!session?.state || !hasJoined) {
			return false;
		}

		return [SessionStateType.Active].includes(session.state);
	}, [session?.state, hasJoined]);

	const question: QuestionDTO | null = useMemo(() => {
		if (!sessionModel?.state || ![SessionStateType.Active, SessionStateType.Locked].includes(sessionModel.state)) {
			return null;
		}

		return sessionModel.getActiveQuestion() || null;
	}, [sessionModel?.state, sessionModel?.questions]);

	const userData = useMemo(() => {
		return {
			answers: session?.questions?.reduce((accum, question) => {
				const qAction = userActions?.find((it) => it.questionId === question?.id);

				accum[question.id] = qAction?.data?.value;

				return accum;
			}, {} as { [questionId: string]: string | undefined }),
			bets: session?.questions?.reduce((accum, question) => {
				const qAction = userActions?.find((it) => it.questionId === question?.id);

				accum[question.id] = qAction?.data?.bet;

				return accum;
			}, {} as { [questionId: string]: number | undefined }),
		};
	}, [session?.questions, userActions]);

	const sessionData: any = useMemo(() => {
		// const _data = {
		// 	totalUsers: 0,
		// 	votesByQuestion: {},
		// };

		// if (session?.data) {
		// 	_data.totalUsers = session.data.totalUsers;

		// 	_data.votesByQuestion = session.data.votesByQuestion;
		// }

		return session?.data;
	}, [session?.data, userData]);

	const questionData = useMemo(() => {
		return session?.questionData;

		// return sessionData.votesByQuestion[question.id] || null;
	}, [question, sessionData]);

	const getQuestionAnswer = (questionId?: string) => {
		if (questionId == null) {
			return undefined;
		}

		return userData?.answers?.[questionId];
	};

	const getQuestionBet = (questionId?: string) => {
		if (questionId == null) {
			return undefined;
		}

		return userData?.bets?.[questionId];
	};

	const currentAnswer = useMemo(() => {
		return getQuestionAnswer(question?.id);
	}, [question?.id, userData]);

	const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(currentAnswer);

	const currentBet = useMemo(() => {
		return getQuestionBet(question?.id);
	}, [question?.id, userData]);

	const [selectedBet, setSelectedBet] = useState<number | undefined>(currentBet);

	const prizeData = useMemo(() => {
		if (!questionData || !selectedAnswer) {
			return 0;
		}

		const totalVotes = questionData?.totalVotes || 0;
		const userTargetOption = questionData.totalByVotes ? questionData.totalByVotes[selectedAnswer] || 0 : 0;
		const userShare = currentBet ? currentBet / userTargetOption : 0;

		return {
			userShare,
			userTotal: totalVotes * userShare,
			totalPoints: totalVotes,
		};
	}, [sessionData, questionData]);

	useEffect(() => {
		const qAnswer = getQuestionAnswer(question?.id);

		if (qAnswer != null) {
			dispatch?.({ type: 'SET_USER_PROGRESS', payload: ProgressStage.Pending });
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

		if (!question || !session) {
			return options;
		}

		if (question.options?.length) {
			const totalByVotes = questionData?.totalByVotes;
			const totalVotes = questionData?.totalVotes || 0;

			question.options.forEach((it, index) => {
				const _option: SelectOption = {
					label: it,
					value: it,
				};

				if (
					questionData &&
					[SessionStateType.Locked, SessionStateType.LockedForReview, SessionStateType.Completed].includes(
						session.state
					)
				) {
					const _itVotes = totalByVotes ? totalByVotes[it] || 0 : 0;
					let progress = !totalByVotes ? 0 : _itVotes / totalVotes;

					if (progress) {
						progress = Number(progress.toFixed(2));
					}

					_option.label = (
						<div className="flex gap-2 items-center">
							<Typography>{_option.label}</Typography>
							<span>-</span>
							<Typography size="small">{progress * 100}%</Typography>
						</div>
					);
				}

				options.push(_option);
			});
		}

		return options;
	}, [question?.options, questionData]);

	const isLoading = useMemo(() => {
		return loading || loadingUserData;
	}, [loading, loadingUserData]);

	const allowBet = useMemo(() => {
		if (!session?.type || ![SessionTypes.USER_BET].includes(session.type)) {
			return false;
		}

		return (
			hasJoined &&
			[SessionStateType.Active, SessionStateType.Locked, SessionStateType.LockedForReview].includes(
				session?.state
			)
		);
	}, [hasJoined, session?.state, currentAnswer]);

	const canBet = useMemo(() => {
		if (!allowBet) {
			return false;
		}

		return session?.state === SessionStateType.Active && !currentAnswer;
	}, [allowBet, session?.state, currentAnswer]);

	const hasAnswer = useMemo(() => {
		return currentAnswer !== undefined;
	}, [currentAnswer]);

	const handleBetChange = (value: number) => {
		setSelectedBet(value);
	};

	const canSave = useMemo(() => {
		// TODO: Implement validation logic based on the question type and options
		// TODO: Check if session require a Bid and if a bid has been placed

		return question?.id && selectedAnswer !== undefined && currentAnswer == null;
	}, [currentAnswer, question, selectedAnswer]);

	const handleJoinSession = () => {
		join?.();
	};
	const handleLeaveSession = () => {
		leave?.();
	};

	const handleSave = () => {
		// TODO: Save the answer to the session
		// TODO: Update the session state to 'Answered'
		// TODO: Update the user's bid if required

		if (!session || !question?.id || !selectedAnswer) {
			return;
		}

		if (canBet && !selectedBet) {
			return;
		}

		postAction({
			sessionId: session.id,
			questionId: question.id,
			type: SessionUserActionTypes.SUBMIT_ANSWER,
			data: { value: selectedAnswer, bet: selectedBet },
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

		const answerVariants = question ? (
			<RadioList
				disabled={!canAnswer || currentAnswer != null}
				items={questionOptions}
				value={selectedAnswer}
				onChange={handleAnswerChange}
			/>
		) : null;

		switch (session.state) {
			case SessionStateType.Published: {
				if (!hasJoined) {
					return (
						<div className="flex flex-col gap-2 items-center">
							<Typography>You need to join the session to proceed</Typography>
							<Button layout="primary" onClick={() => handleJoinSession()}>
								Join session
							</Button>
						</div>
					);
				}

				return (
					<div className="flex flex-col gap-2 items-center">
						<Typography>Please wait, we will start shortly</Typography>
						<Button layout="primary" onClick={() => handleLeaveSession()}>
							Leave session
						</Button>
					</div>
				);
			}
			case SessionStateType.Active:
				const controls = canAnswer ? (
					currentAnswer == null ? (
						<Button layout="primary" disabled={!canSave} onClick={handleSave}>
							Confirm answer
						</Button>
					) : (
						<Button layout="outline" onClick={handleCancelAnswer}>
							Cancel answer
						</Button>
					)
				) : (
					<Typography>You can't participate</Typography>
				);

				return (
					<>
						{answerVariants}
						{allowBet && (
							<SessionBetInput disabled={!canBet} onChange={handleBetChange} initialValue={selectedBet} />
						)}
						{controls}
					</>
				);
			case SessionStateType.Locked:
			case SessionStateType.LockedForReview: {
				if (!answerVariants && !prizeData) {
					return (
						<div className="flex flex-col justify-center items-center">
							<Icon size={48} name="PiggyBank" className="relative -top-6 animate-bounce" />
							<Typography className="text-center relative -right-2">
								Almost done. Calculating stage summary..
							</Typography>
						</div>
					);
				}

				return (
					<>
						{answerVariants}
						{allowBet && (
							<div className="text-center">
								<Typography>Selected Bet</Typography>
								<Typography size="large">
									<b>{selectedBet}</b>
								</Typography>
							</div>
						)}
						{prizeData ? (
							<div className="px-8 py-4 bg-gray-100 rounded text-center">
								<div>
									Your share is <b>{prizeData.userShare * 100}%</b>
								</div>
								<div>
									Potential prize is <b>{prizeData.userTotal}</b> points
								</div>
							</div>
						) : null}
					</>
				);
			}
			case SessionStateType.Completed: {
				const userPrize = user?.id ? sessionData?.userScores?.summary?.[user.id] : 0;

				console.log('Session data', sessionData);

				const hasPrize = !!userPrize;

				return (
					<div className="flex flex-col gap-4 items-center">
						{hasPrize ? (
							<div className="text-center">
								<Typography size="large">
									YOU WON <b className="text-[1.25em]">{userPrize}</b> point(s).
								</Typography>
								<Typography size="small">The Prize was transferred to your account</Typography>
							</div>
						) : (
							<Typography>Good luck next time!</Typography>
						)}

						<LinkButton layout="primary" href="/explore" size="large" className="min-w-[100px]">
							Ok
						</LinkButton>
					</div>
				);
			}
			default: {
				return <>{answerVariants}</>;
			}
		}
	}, [sessionData, canAnswer, prizeData, hasJoined, currentAnswer, selectedAnswer, selectedBet, isLoading]);

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
