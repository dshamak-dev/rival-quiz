import { SessionDTO, SessionStateType } from '@model/session.model';
import { Button, ButtonSizeType } from '@view/button/button';
import { SessionAdminQuestionAnswerModalButton } from '../admin/session.admin.question-nswer-modal-buttoon';
import { SessionAdminResolveButton } from '../admin/session.admin.resolve-button';
import { SingleQuestionSession } from '@model/session/single-question';
import { requestQuestionSync } from '@api/question.api';

export type SingleQuestionSessionHeaderProps = {
	session?: SessionDTO;
	loading: boolean;
	onUpdate: (path: string, value: any) => Promise<SessionDTO>;
	onDelete?: () => Promise<void>;
};

export function SingleQuestionSessionHeader({
	session,
	loading,
	onUpdate,
	onDelete,
}: SingleQuestionSessionHeaderProps) {
	const questionModel = new SingleQuestionSession(session);
	const buttonCommonProps: { className: string; size: ButtonSizeType; disabled: boolean } = {
		size: 'small',
		className: 'min-w-[100px]',
		disabled: loading,
	};

	const participantsNumber = session?.users?.length || 0;
	const activeQuestion = questionModel?.getActiveQuestion();

	switch (session?.state) {
		case SessionStateType.Draft: {
			const canPublish = !!session.questions?.length;

			return (
				<>
					<Button
						{...buttonCommonProps}
						layout="primary"
						disabled={!canPublish || buttonCommonProps.disabled}
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
						disabled={!participantsNumber || participantsNumber < 2}
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
			return (
				<>
					<Button
						{...buttonCommonProps}
						layout="primary"
						onClick={() => {
							onUpdate('info', { state: SessionStateType.Locked });
						}}
						disabled={!participantsNumber || participantsNumber < 2}
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
					<SessionAdminQuestionAnswerModalButton session={session} buttonProps={buttonCommonProps} />
				</>
			);
		}
		case SessionStateType.LockedForReview: {
			return (
				<>
					<SessionAdminResolveButton session={session} buttonProps={buttonCommonProps} />
				</>
			);
		}
	}

	return null;
}
