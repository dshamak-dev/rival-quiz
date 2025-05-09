import { SessionDTO, SessionStateType } from '@model/session.model';
import { Button, ButtonSizeType } from '@view/button/button';
import { SessionAdminQuestionAnswerModalButton } from '../admin/session.admin.question-nswer-modal-buttoon';
import { SessionAdminResolveButton } from '../admin/session.admin.resolve-button';
// import { SingleQuestionSession } from '@model/session/single-question';
import { validateSessionGeneral, validateSessionQuestions } from 'src/session/helpers';
import { useAPI } from '@api/api.hook';
import { syncSessionData } from '@api/session.api';
// import { requestQuestionSync } from '@api/question.api';

export type SingleQuestionSessionHeaderProps = {
	session?: SessionDTO;
	loading: boolean;
	onUpdate: (path: string, value: any) => Promise<SessionDTO>;
	onDelete?: () => Promise<void>;
	onRefetch?: () => Promise<any>;
};

export function SingleQuestionSessionHeader({
	session,
	loading,
	onUpdate,
	onDelete,
	onRefetch,
}: SingleQuestionSessionHeaderProps) {
	// const questionModel = new SingleQuestionSession(session);
	const buttonCommonProps: { className: string; size: ButtonSizeType; disabled: boolean } = {
		size: 'small',
		className: 'min-w-[100px]',
		disabled: loading,
	};

	const { loading: isSyncing, dispatch } = useAPI({
		request: (sessionId: any) => syncSessionData(sessionId as SessionDTO['id']),
	});

	const participantsNumber = session?.users?.length || 0;

	const handleSyncSessionData = () => {
		if (session?.id){
			dispatch(session.id);
		}
	};

	switch (session?.state) {
		case SessionStateType.Draft: {
			let validation = validateSessionGeneral(session);

			if (validation.isValid) {
				validation = validateSessionQuestions(session);
			}

			return (
				<>
					<Button
						{...buttonCommonProps}
						layout="primary"
						error={validation.error}
						disabled={!validation.isValid || buttonCommonProps.disabled}
						onClick={() => {
							onUpdate('info', { state: SessionStateType.Published });
						}}
					>
						Publish
					</Button>
					<Button {...buttonCommonProps} onClick={onDelete}>
						Delete
					</Button>
				</>
			);
		}
		case SessionStateType.Published: {
			const validParticipants = participantsNumber >= 2;

			return (
				<>
					<Button
						{...buttonCommonProps}
						onClick={() => {
							onUpdate('info', { state: SessionStateType.Draft });
						}}
					>
						Unpublish
					</Button>
					<Button
						{...buttonCommonProps}
						layout="primary"
						onClick={() => {
							onUpdate('info', { state: SessionStateType.Active });
						}}
						disabled={!validParticipants}
						error={!validParticipants ? 'At least 2 participants are required.' : undefined}
					>
						Start
					</Button>
					<Button {...buttonCommonProps} onClick={onDelete}>
						Delete
					</Button>
				</>
			);
		}
		case SessionStateType.Active: {
			const validParticipants = participantsNumber >= 2;

			return (
				<>
					<Button
						{...buttonCommonProps}
						layout="primary"
						onClick={() => {
							onUpdate('info', { state: SessionStateType.Locked });
						}}
						disabled={!validParticipants}
						errorProps={{
							style: { right: 0 },
						}}
						error={!validParticipants ? 'At least 2 participants are required.' : undefined}
					>
						Lock
					</Button>
					{/* <Button {...buttonCommonProps} onClick={onDelete}>
						Delete
					</Button> */}
				</>
			);
		}
		case SessionStateType.Locked: {
			return (
				<>
					<Button
						{...buttonCommonProps}
						onClick={() => {
							onUpdate('info', { state: SessionStateType.Active });
						}}
					>
						Unlock
					</Button>
					<SessionAdminQuestionAnswerModalButton
						session={session}
						buttonProps={buttonCommonProps}
						onSubmit={onRefetch}
					/>
				</>
			);
		}
		case SessionStateType.LockedForReview: {
			return (
				<>
					<Button {...buttonCommonProps} layout="secondary" loading={isSyncing} onClick={handleSyncSessionData}>
						Sync Results
					</Button>
					<SessionAdminResolveButton session={session} buttonProps={buttonCommonProps} onSubmit={onRefetch} />
				</>
			);
		}
	}

	return null;
}
