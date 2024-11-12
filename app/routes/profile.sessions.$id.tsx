import { useAPI } from '@api/api.hook';
import { findSessionById } from '@api/session.api';
import { QuestionType } from '@model/question.model';
import { Session, SessionDTO, SessionStateType, SessionType } from '@model/session.model';
import { useParams } from '@remix-run/react';
import { Anchor } from '@view/anchor';
import { Button, ButtonSizeType } from '@view/button/button';
import { Collapse } from '@view/collapse/collapse';
import { Select } from '@view/form/form.select';
import { TextInput } from '@view/form/form.text-input';
import { Icon } from '@view/icon';
import { QuestionForm } from '@view/question/question.form';
import { Typography } from '@view/typography/typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { sessionStateOptions } from 'src/constants/session.constant';

export default function ProfileSessionPage() {
	const params = useParams();
	const { data, loading, dispatch } = useAPI({
		request: (id: SessionDTO['id']) => findSessionById(id),
		initialState: undefined,
	});
	const [sessionState, setSessionState] = useState<Session | undefined>(undefined);

	useEffect(() => {
		if (!params?.id) {
			return;
		}

		dispatch(params.id);
	}, [params.id]);

	useEffect(() => {
		if (data) {
			setSessionState(new Session(data));
		}
	}, [data]);

	const handleAddQuestion = useCallback(() => {
		const state = sessionState ? { ...sessionState } : {};
		const nextState = new Session(state as SessionType);

		if (!nextState.questions) {
			nextState.questions = [];
		}

		nextState.questions.push({
			id: Math.random().toString(36).substr(2, 9),
			type: QuestionType.SINGLE,
			options: [],
			answer: '',
			title: '',
			created: new Date().toISOString(),
		});

		setSessionState(nextState);
	}, [sessionState]);

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
					title="Info"
					initialState={[
						SessionStateType.Draft,
						SessionStateType.Published,
						SessionStateType.Paused,
					].includes(sessionState.state)}
				>
					<div className="flex flex-col gap-4 p-4">
						<TextInput id="title" label="title" defaultValue={sessionState.title} />
						<TextInput id="description" label="description" defaultValue={sessionState.description || ''} />
						<Select
							id="state"
							label="state"
							disabled
							options={sessionStateOptions}
							defaultValue={sessionState.state}
						/>
						<div className="flex justify-end gap-4">
							<Button layout="primary" size="small" className="min-w-[100px]">
								Save
							</Button>
							<Button size="small" className="min-w-[100px]">
								Cancel
							</Button>
						</div>
					</div>
				</Collapse>

				<Collapse
					title={`Questions (${sessionState?.questions?.length || 0})`}
					initialState={!sessionState.questions?.length}
				>
					<div className="flex flex-col gap-6 p-4">
						{sessionState.questions?.length ? (
							sessionState.questions.map((it, index) => {
								return (
									<Collapse
										key={it.id}
										title={
											<div className="flex gap-2 items-center">
												<Icon name="QuestionSquareFill" />
												<Typography>{`Question ${index + 1}`}</Typography>
											</div>
										}
									>
										<QuestionForm initialValue={it} />
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
	}, [sessionState, loading, handleAddQuestion]);

	const controls = useMemo(() => {
		const buttonCommonProps: { className: string; size: ButtonSizeType } = {
			size: 'small',
			className: 'min-w-[100px]',
		};

		switch (data?.state) {
			case SessionStateType.Draft: {
				const canPublish = !!data.questions?.length;

				return (
					<>
						<Button {...buttonCommonProps} layout="primary" disabled={!canPublish}>
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
						<Button {...buttonCommonProps} layout="primary">
							Unpublish
						</Button>
						<Button {...buttonCommonProps}>Delete</Button>
					</>
				);
			}
		}

		return null;
	}, [data]);

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
