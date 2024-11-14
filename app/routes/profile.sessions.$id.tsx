import { useAPI } from '@api/api.hook';
import { findSessionById, patchSession, deleteSessionQuestion, postSessionQuestion } from '@api/session.api';
import { getErrorMessage } from '@control/api.control';
import { QuestionDTO } from '@model/question.model';
import { Session, SessionDTO, SessionStateType, SessionType } from '@model/session.model';
import { useParams } from '@remix-run/react';
import { Anchor } from '@view/anchor';
import { Button, ButtonSizeType } from '@view/button/button';
import { Collapse } from '@view/collapse/collapse';
import { Icon } from '@view/icon';
import { QuestionForm } from '@view/question/question.form';
import { SessionInfoForm } from '@view/session/session.info-form';
import { Typography } from '@view/typography/typography';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function ProfileSessionPage() {
	const params = useParams();
	const { data, loading, dispatch, set } = useAPI({
		request: (id: SessionDTO['id']) => findSessionById(id),
		initialState: undefined,
	});

	const sessionId = useMemo(() => {
		return params?.id as SessionDTO['id'];
	}, [params?.id]);

	const { loading: isPatching, dispatch: dispatchPatch } = useAPI({
		request: (payload: any) => patchSession(sessionId as SessionDTO['id'], payload),
	});
	const { loading: isDeletingQuestion, dispatch: dispatchDeleteQuestion } = useAPI({
		request: (id: QuestionDTO['id']) => deleteSessionQuestion(sessionId, id),
	});
	const { loading: isCreatingQuestion, dispatch: dispatchCreateQuestion } = useAPI({
		request: () => postSessionQuestion(sessionId as SessionDTO['id'], null),
	});
	const [sessionState, setSessionState] = useState<Session | undefined>(undefined);

	const isBusy = useMemo(() => {
		return loading || isPatching || isDeletingQuestion || isCreatingQuestion;
	}, [loading, isPatching, isDeletingQuestion, isCreatingQuestion]);

	useEffect(() => {
		if (!sessionId) {
			return;
		}

		dispatch(sessionId);
	}, [sessionId]);

	useEffect(() => {
		if (data) {
			setSessionState(new Session(data));
		}
	}, [data]);

	const handleAddQuestion = useCallback(async () => {
		const question = await dispatchCreateQuestion().catch((err) => null);

		if (!question) {
			return;
		}

		const state = sessionState ? { ...sessionState } : {};
		const nextState = new Session(state as SessionType);

		if (!nextState.questions) {
			nextState.questions = [];
		}

		nextState.questions.push(question);

		setSessionState(nextState);
	}, [sessionState, dispatchCreateQuestion]);

	const handleDeleteQuestion = useCallback(
		async (questionId: QuestionDTO['id']) => {
			const { ok, error } = await dispatchDeleteQuestion(questionId)
				.then(() => {
					return { ok: true, error: null };
				})
				.catch((err) => {
					return { ok: false, error: getErrorMessage(err) };
				});

			if (ok) {
				setSessionState((current) => {
					const next = current ? { ...current } : new Session(current);
					const questions = current?.questions?.filter((it) => it.id != questionId) || [];

					return { ...next, questions };
				});
			}
		},
		[dispatchDeleteQuestion]
	);

	const handleUpdate = (path: string, value: any) => {
		return dispatchPatch({ path, value }).then((res) => {
			setSessionState((current) => {
				let next = current ? { ...current } : new Session(current);
				const [target, targetId] = path.split('.');

				switch (target) {
					case 'questions': {
						const questions = next.questions || [value];

						next = { ...next, questions: questions.map((it) => (it.id === targetId ? value : it)) };
						break;
					}
					default: {
						next = { ...next, ...value };
						break;
					}
				}

				return next;
			});

			return res;
		});
	};

	const content = useMemo(() => {
		if (loading || sessionState === undefined) {
			return (
				<div className="h-full flex flex-col items-center justify-center justify-self-center align-self-center">
					<Icon size={48} name="InfoSquare" className="relative -top-6 animate-bounce" />
					<Typography className="text-center relative -right-2">Loading...</Typography>
				</div>
			);
		}

		if (!sessionState) {
			return <div>Session not found</div>;
		}

		const nowTime = Date.now();

		return (
			<>
				<Collapse
					title="General"
					initialState={[
						SessionStateType.Draft,
						SessionStateType.Published,
						SessionStateType.Paused,
					].includes(sessionState.state)}
				>
					<SessionInfoForm
						initialValue={sessionState}
						onSubmit={(values: any) => handleUpdate('info', values)}
						disabled={isBusy}
					/>
				</Collapse>

				<Collapse
					title={`Questions (${sessionState?.questions?.length || 0})`}
					initialState={!sessionState.questions?.length || sessionState.questions.length <= 1}
				>
					<div className="flex flex-col gap-6 p-4">
						{sessionState.questions?.length ? (
							sessionState.questions.map((question, index) => {
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

												<div
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteQuestion(question.id);
													}}
												>
													<Icon name="Trash" />
												</div>
											</div>
										}
									>
										<QuestionForm
											initialValue={question}
											disabled={isBusy}
											onSubmit={(questionData) =>
												handleUpdate(`questions.${question.id}`, questionData)
											}
										/>
									</Collapse>
								);
							})
						) : (
							<Typography className="text-xs">No questions</Typography>
						)}
						<div>
							<Button
								layout="tertiary"
								size="small"
								className="flex gap-2 items-center"
								onClick={() => {
									handleAddQuestion();
								}}
							>
								<Icon name="PlusCircle" />
								Add question
							</Button>
						</div>
					</div>
				</Collapse>

				<Collapse title="Participants" initialState={true}>
					<div className="p-4">
						<Typography className="text-xs">No participants</Typography>
					</div>
				</Collapse>
			</>
		);
	}, [sessionState, loading, isBusy, handleAddQuestion]);

	const controls = useMemo(() => {
		const buttonCommonProps: { className: string; size: ButtonSizeType; disabled: boolean } = {
			size: 'small',
			className: 'min-w-[100px]',
			disabled: isBusy || loading,
		};

		switch (sessionState?.state) {
			case SessionStateType.Draft: {
				const canPublish = !!sessionState.questions?.length;

				return (
					<>
						<Button
							{...buttonCommonProps}
							layout="primary"
							disabled={!canPublish || buttonCommonProps.disabled}
							onClick={() => {
								handleUpdate('info', { state: SessionStateType.Published });
							}}
						>
							Publish
						</Button>
						<Button {...buttonCommonProps}>Delete</Button>
					</>
				);
			}
			case SessionStateType.Published:
			case SessionStateType.Paused: {
				return (
					<>
						<Button {...buttonCommonProps} layout="primary" onClick={() => {
								handleUpdate('info', { state: SessionStateType.Draft });
							}}>
							Unpublish
						</Button>
						<Button {...buttonCommonProps}>Delete</Button>
					</>
				);
			}
		}

		return null;
	}, [sessionState, loading, isBusy]);

	return (
		<div className="min-h-full p-4 grid grid-rows-[auto_1fr] gap-6">
			<div className="flex items-center justify-between gap-6">
				<Anchor end href="/profile/sessions" className="flex items-center gap-2 text-xs">
					<Icon name="ArrowLeft" />
					<Typography className="text-xs">Go Back</Typography>
				</Anchor>
				<div className="flex items-center justify-end gap-4">{controls}</div>
			</div>
			<div className="flex flex-col gap-6">{content}</div>
		</div>
	);
}
