import { useAPI } from '@api/api.hook';
import {
	findSessionById,
	patchSession,
	deleteSession,
	deleteSessionQuestion,
	postSessionQuestion,
	findAdminSessionById,
} from '@api/session.api';
import { getErrorMessage } from '@control/api.control';
import { QuestionDTO } from '@model/question.model';
import { SessionDTO, SessionStateType, SessionTypes } from '@model/session.model';
import { useLoaderData, useNavigate, useParams } from '@remix-run/react';
import { Anchor } from '@view/anchor';
import { Collapse } from '@view/collapse/collapse';
import { Icon } from '@view/icon';
import { SingleQuestionSessionHeader } from '@view/session/single-question/single-question.controls';
import { SessionInfoForm } from '@view/session/session.info-form';
import { Typography } from '@view/typography/typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SESSION_TYPE_OPTIONS, sessionStateLabels } from 'src/constants/session.constant';
import { SingleQuestionSessionForm } from '@view/session/single-question/single-question.form';
import { SessionParticipantsForm } from '@view/session/session.participants-form';
import { Session } from '@model/session';
import classNames from 'classnames';
import { useAuth } from '@state/auth.hook';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { authProtectedRoute } from '@/auth';
import { Button } from '@view/button/button';
import { enumToLabel } from '@control/format.helpers';

type StateType = SessionDTO | undefined;

export async function loader({ request, params }: LoaderFunctionArgs) {
	return authProtectedRoute(request).then(async (res) => {
		const { ok } = res;

		if (!ok) {
			return {
				initialState: null,
			};
		}

		const sessionId = params.id as string;
		const data = await findAdminSessionById(sessionId)
			.then((res) => {
				return res;
			})
			.catch((err) => null);

		return json({
			initialState: data,
		});
	});
}
enum FormStages {
	Draft,
	Info,
	Questions,
	Participants,
}

export default function ProfileSessionPage() {
	const { user } = useAuth();
	const { initialState = null } = useLoaderData<typeof loader>();
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
		initialState: initialState as SessionDTO,
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
	const [formStage, setFormStage] = useState<FormStages>(FormStages.Draft);

	const isBusy = useMemo(() => {
		return loading || isPatching || isDeletingQuestion || isCreatingQuestion;
	}, [loading, isPatching, isDeletingQuestion, isCreatingQuestion]);

	useEffect(() => {
		if (data != null) {
			const _it = new Session(data).json;

			switch (_it?.state) {
				case SessionStateType.Draft: {
					setFormStage(!data.title ? FormStages.Info : FormStages.Questions);
					break;
				}
				default:
					setFormStage(FormStages.Questions);
					break;
			}

			setSessionState(_it);
		} else {
			setSessionState(null);
		}
	}, [data]);

	const handleFetchSession = useCallback(() => {
		return dispatch(sessionId);
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
			setSessionState(res);
			// setSessionState((current: any) => {
			// 	let next = current ? { ...current } : new Session(current);
			// 	const [target, targetId] = path.split('.');

			// 	switch (target) {
			// 		case 'questions': {
			// 			const questions = next.questions || [value];

			// 			next = {
			// 				...next,
			// 				questions: questions.map((it: QuestionDTO) => (it.id === targetId ? value : it)),
			// 			};
			// 			break;
			// 		}
			// 		default: {
			// 			next = { ...next, ...value };
			// 			break;
			// 		}
			// 	}

			// 	return next;
			// });

			return res;
		});
	};

	const canChangeType = !sessionState?.type || sessionState?.state === SessionStateType.Draft;

	const handleSelectType = (nextType: SessionTypes | undefined) => {
		if (!canChangeType) {
			return;
		}

		handleUpdate('info', {
			type: nextType,
		}).then(() => {});
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

		if (!sessionState?.type) {
			return (
				<div className="h-full flex flex-col p-8 items-center">
					<Typography className="text-xl mb-4">Select one type below</Typography>
					<div className="flex flex-col lg:flex-row gap-6">
						{SESSION_TYPE_OPTIONS.map((it) => {
							return (
								<div
									key={it.value}
									className={classNames(
										'grid grid-rows-[1fr_auto] gap-8 lg:h-full min-h-[200px] border-2 border-gray-200 p-8 rounded-md lg:min-w-[240px] max-w-full',
										'overflow-hidden',
										{
											'text-gray-400 pointer-events-none': !it.enabled,
										}
									)}
								>
									<div className="flex flex-col items-center gap-4 text-center">
										<Icon size={64} name={it.icon} />
										<Typography className="font-bold text-2xl uppercase" size="custom">
											{it.label}
										</Typography>
										<Typography>{it.text}</Typography>
									</div>
									{it.enabled ? (
										<Button
											layout={it.enabled ? 'primary' : undefined}
											onClick={() => handleSelectType(it.value)}
											disabled={!it.enabled || isBusy}
										>
											Select
										</Button>
									) : (
										<Typography size="custom" className="py-2 text-center text-gray-400">
											Not available
										</Typography>
									)}
								</div>
							);
						})}
					</div>
				</div>
			);
		}

		if (formStage === FormStages.Info) {
			return (
				<div className="border rounded-sm">
					<SessionInfoForm
						onSubmit={(values: any) =>
							handleUpdate('info', values).then(() => {
								setFormStage(FormStages.Questions);
							})
						}
						onCancel={() => {
							if (!!sessionState.title?.trim()) {
								setFormStage(FormStages.Questions);
							}
						}}
						initialValue={sessionState}
						disabled={isBusy}
					/>
				</div>
			);
		}

		return (
			<>
				<Collapse
					title={(isOpen) =>
						isOpen ? 'General' : `General - ${sessionStateLabels[sessionState.state] || 'Unknown'}`
					}
					initialState={[SessionStateType.Draft, SessionStateType.Published].includes(sessionState.state)}
				>
					<SessionInfoForm preview initialValue={sessionState} disabled>
						{sessionState.state === SessionStateType.Draft && (
							<div>
								<Button
									type="submit"
									size="small"
									disabled={isBusy}
									onClick={() => setFormStage(FormStages.Info)}
								>
									Edit
								</Button>
							</div>
						)}
					</SessionInfoForm>
				</Collapse>

				<Collapse title={`Questions (${sessionState?.questions?.length || 0})`} initialState={true}>
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
					initialState={[SessionStateType.Active].includes(sessionState.state)}
				>
					<SessionParticipantsForm
						session={sessionState}
						loading={loading || isBusy}
						onUpdate={handleUpdate}
					/>
				</Collapse>
			</>
		);
	}, [sessionState, formStage, loading, isBusy, handleAddQuestion, handleDeleteQuestion]);

	const controls = useMemo(() => {
		if (!sessionState) {
			return null;
		}

		return (
			<SingleQuestionSessionHeader
				session={sessionState}
				loading={loading || isBusy}
				onUpdate={handleUpdate}
				onDelete={handleDeleteSession}
				onRefetch={handleFetchSession}
			/>
		);
	}, [sessionState, loading, isBusy]);

	return (
		<div className="min-h-full p-4 grid grid-rows-[auto_1fr] gap-2 bg-inherit overflow-y-auto">
			<div className="sticky -top-4 py-4 bg-inherit z-10 flex items-center justify-between gap-6 bg-white">
				<div>
					{!!sessionState?.type && (
						<div
							className="flex items-center gap-2 text-xs cursor-pointer"
							title="Change type"
							onClick={() => handleSelectType(undefined)}
						>
							<Typography className="max-[640px]:hidden">
								Type: <b className="uppercase">{enumToLabel(sessionState.type)}</b>
							</Typography>
							{canChangeType && <Icon name="Pencil" />}
						</div>
					)}
				</div>
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
