import { Session, SessionDTO, SessionStateType } from '@model/session.model';
import { Button, ButtonSizeType } from '@view/button/button';

export type SingleQuestionSessionHeaderProps = {
	session?: Session;
	loading: boolean;
	onUpdate: (path: string, value: any) => Promise<SessionDTO>;
};

export function SingleQuestionSessionHeader({ session, loading, onUpdate }: SingleQuestionSessionHeaderProps) {
	const buttonCommonProps: { className: string; size: ButtonSizeType; disabled: boolean } = {
		size: 'small',
		className: 'min-w-[100px]',
		disabled: loading,
	};

	const participantsNumber = session?.users?.length || 0;

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
					<Button {...buttonCommonProps}>Delete</Button>
				</>
			);
		}
		case SessionStateType.Published:
		case SessionStateType.Paused: {
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
							onUpdate('info', { state: SessionStateType.Locked });
						}}
						disabled={!participantsNumber || participantsNumber < 2}
					>
						Lock
					</Button>
					<Button {...buttonCommonProps}>Delete</Button>
				</>
			);
		}
		case SessionStateType.Locked: {
			return (
				<>
					<Button
						{...buttonCommonProps}
						onClick={() => {
							// TOSO: show confirm dialog with answer selection before completing the session
							// handleUpdate('info', { state: SessionStateType.Completed });
						}}
						layout="primary"
					>
						Complete
					</Button>
				</>
			);
		}
	}

	return null;
}
