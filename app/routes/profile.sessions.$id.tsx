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
import { SingleQuestionSessionHeader } from '@view/session/single-question/single-question.controls';
import { SessionInfoForm } from '@view/session/session.info-form';
import { Typography } from '@view/typography/typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { sessionStateLabels } from 'src/constants/session.constant';
import { SingleQuestionSessionForm } from '@view/session/single-question/single-question.form';
import { SessionparticipantsForm } from '@view/session/session.participants-form';

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

		return (
			<>
				<Collapse
					title={(isOpen) =>
						isOpen ? 'General' : `General - ${sessionStateLabels[sessionState.state] || 'Unknown'}`
					}
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
					<SingleQuestionSessionForm
						session={sessionState}
						loading={loading || isBusy}
						onUpdate={handleUpdate}
						onAdd={handleAddQuestion}
						onDelete={handleDeleteQuestion}
					/>
				</Collapse>

				<Collapse
					title={`Participants (${sessionState?.users?.length || 0})`}
					initialState={!sessionState?.users?.length || sessionState.users.length < 3}
				>
					<SessionparticipantsForm
						session={sessionState}
						loading={loading || isBusy}
						onUpdate={handleUpdate}
					/>
				</Collapse>
			</>
		);
	}, [sessionState, loading, isBusy, handleAddQuestion, handleDeleteQuestion]);

	const controls = useMemo(() => {
		return (
			<SingleQuestionSessionHeader session={sessionState} loading={loading || isBusy} onUpdate={handleUpdate} />
		);
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
