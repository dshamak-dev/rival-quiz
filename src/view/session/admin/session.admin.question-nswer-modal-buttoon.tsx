import { SessionAnswerPayload, SessionDTO } from '@model/session.model';
import { postSessionQuestionAnswer } from '@api/session.api';
import { SessionQuestionAnswerForm } from '../session.question-answer-form';
import { ModalButton } from '@view/modal/modal.button';
import { ButtonProps } from '@view/button/button';
import { useState } from 'react';

export function SessionAdminQuestionAnswerModalButton({
	session,
	buttonProps,
}: {
	session: SessionDTO;
	buttonProps?: ButtonProps;
}) {
	const [{ payload, isValid }, setFormData] = useState<{
		isValid: boolean;
		payload: SessionAnswerPayload | undefined;
	}>({ isValid: false, payload: undefined });
	const sessionId = session?.id;

	const handleSubmit = async (): Promise<void> => {
		if (!payload) {
			throw new Error('No answer selected');
		}

		return postSessionQuestionAnswer(sessionId as SessionDTO['id'], payload)
			.then((res) => {
				return;
			})
			.catch((err) => {
				console.error(err);

				throw new Error(err || 'Failed to set answer');
			});
	};

	return (
		<ModalButton
			title="Confirm completion"
			buttonProps={{
				...buttonProps,
				onClick: () => {
					// TODO: show confirm dialog with answer selection before completing the session
					// onUpdate('info', { state: SessionStateType.Completed });
				},
				layout: 'primary',
				children: 'Set Answer',
			}}
			okButtonProps={{
				disabled: !isValid,
			}}
			beforeClose={handleSubmit}
		>
			<SessionQuestionAnswerForm
				session={session}
				onChange={async (payload: any, isValid: boolean) => {
					setFormData({ payload, isValid });
				}}
			/>
		</ModalButton>
	);
}
