import { useAPI } from '@api/api.hook';
import {
	findSessionById,
	patchSession,
	deleteSession,
	deleteSessionQuestion,
	postSessionQuestion,
} from '@api/session.api';
import { getErrorMessage } from '@control/api.control';
import { QuestionDTO } from '@model/question.model';
import { SessionDTO, SessionStateType } from '@model/session.model';
import { useNavigate, useParams } from '@remix-run/react';
import { Anchor } from '@view/anchor';
import { Collapse } from '@view/collapse/collapse';
import { Icon } from '@view/icon';
import { SingleQuestionSessionHeader } from '@view/session/single-question/single-question.controls';
import { SessionInfoForm } from '@view/session/session.info-form';
import { Typography } from '@view/typography/typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { sessionStateLabels } from 'src/constants/session.constant';
import { SingleQuestionSessionForm } from '@view/session/single-question/single-question.form';
import { SessionparticipantsForm } from '@view/session/session.participants-form';
import { Session } from '@model/session';
import classNames from 'classnames';
import { useAuth } from '@state/auth.hook';

type StateType = SessionDTO | undefined;

export default function ProfileSessionPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const params = useParams();
	const { data, loading, dispatch, set } = useAPI({
		request: (id: SessionDTO['id']) =>
			findSessionById(id).then((res) => {
				if (res.ownerId === user?.id) {
					return res;
				}
				return null;
			}),
		initialState: undefined,
	});

	const sessionId = useMemo(() => {
		return params?.id as SessionDTO['id'];
	}, [params?.id]);

	const { loading: isPatching, dispatch: dispatchPatch } = useAPI({
		request: (payload: any) => patchSession(sessionId as SessionDTO['id'], payload),
	});
	const { loading: isDeleting, dispatch: dispatchDelete } = useAPI({
		request: () => deleteSession(sessionId as SessionDTO['id']),
	});
	const { loading: isDeletingQuestion, dispatch: dispatchDeleteQuestion } = useAPI({
		request: (id: QuestionDTO['id']) => deleteSessionQuestion(sessionId, id),
	});
	const { loading: isCreatingQuestion, dispatch: dispatchCreateQuestion } = useAPI({
		request: () => postSessionQuestion(sessionId as SessionDTO['id'], null),
	});
	const [sessionState, setSessionState] = useState<StateType | null>(undefined);

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
		if (data != null) {
			const _it = new Session(data).json;
			setSessionState(_it);
		} else {
			setSessionState(null);
		}
	}, [data]);

	const handleFetchSession = useCallback(() => {
		dispatch(sessionId);
	}, [dispatch]);

	const handleAddQuestion = useCallback(async () => {
		const question = await dispatchCreateQuestion().catch((err) => null);

		if (!question) {
			return;
		}

		const state = sessionState ? { ...sessionState } : {};
		const nextState = new Session(state as SessionDTO).json;

		if (!nextState.questions) {
			nextState.questions = [];
		}

		nextState.questions.push(question);

		setSessionState(nextState);
	}, [sessionState, dispatchCreateQuestion]);

	const handleDeleteSession = useCallback(async () => {
		if (!sessionState) {
			return;
		}

		dispatchDelete(sessionState.id).then(() => {
			navigate('/profile/sessions');
		});
	}, [sessionState]);

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
				setSessionState((current: any) => {
					const next = current ? { ...current } : new Session(current);
					const questions = current?.questions?.filter((it: QuestionDTO) => it.id != questionId) || [];

					return { ...next, questions };
				});
			}
		},
		[dispatchDeleteQuestion]
	);

	const handleUpdate = (path: string, value: any) => {
		return dispatchPatch({ path, value }).then((res) => {
			setSessionState((current: any) => {
				let next = current ? { ...current } : new Session(current);
				const [target, targetId] = path.split('.');

				switch (target) {
					case 'questions': {
						const questions = next.questions || [value];

						next = {
							...next,
							questions: questions.map((it: QuestionDTO) => (it.id === targetId ? value : it)),
						};
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
					initialState={[SessionStateType.Draft, SessionStateType.Published].includes(sessionState.state)}
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
		if (!sessionState){
			return null;
		}

		return (
			<SingleQuestionSessionHeader
				session={sessionState}
				loading={loading || isBusy}
				onUpdate={handleUpdate}
				onDelete={handleDeleteSession}
			/>
		);
	}, [sessionState, loading, isBusy]);

	return (
		<div className="min-h-full p-4 grid grid-rows-[auto_1fr] gap-6 bg-inherit">
			<div className="sticky top-0 bg-inherit z-10 flex items-center justify-between gap-6">
				<Anchor end href="/profile/sessions" className="flex items-center gap-2 text-xs">
					<Icon name="ArrowLeft" />
					<Typography className="text-xs max-[640px]:hidden">Go Back</Typography>
				</Anchor>
				<div className="flex items-center justify-end gap-4">
					<Anchor href={`/sessions/${sessionId}`} className="text-xs text-black hover:text-blue-600">
						<Icon name="Eye" size={18} />
					</Anchor>
					<div className="p-2 cursor-pointer opacity-50 hover:opacity-100" onClick={handleFetchSession}>
						<Icon
							name="ArrowClockwise"
							size={18}
							className={classNames({
								'animate-spin': loading,
							})}
						/>
					</div>
					{controls}
				</div>
			</div>
			<div className="flex flex-col gap-6">{content}</div>
		</div>
	);
}
