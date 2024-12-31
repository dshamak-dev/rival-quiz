import { isNullOrEmpty } from '@control/validate.utils';
import { SessionAnswerPayload, SessionDTO } from '@model/session.model';
import { SingleQuestionSession } from '@model/session/single-question';
import { Select } from '@view/form/form.select';
import { useEffect, useMemo, useState } from 'react';

export type SessionQuestionAnswerFormProps = {
	session: SessionDTO;
	onSubmit?: (payload: SessionAnswerPayload) => void;
	onChange?: (payload: SessionAnswerPayload, isValid: boolean) => void;
};

export function SessionQuestionAnswerForm({ session, onSubmit, onChange }: SessionQuestionAnswerFormProps) {
	const [payload, setPayload] = useState<SessionAnswerPayload>({ questionId: '', answer: '' });

	const question = useMemo(() => {
		return new SingleQuestionSession(session).getActiveQuestion();
	}, [session]);
	const answerOptions = useMemo(() => {
		if (!question?.options?.length) {
			return [
				{
					label: 'No option available',
					value: '',
					disabled: true,
				},
			];
		}

		return [
			{
				label: 'Select an answer',
				value: '',
				disabled: true,
			},
			...question?.options?.map((it) => {
				return {
					label: it,
					value: it,
				};
			}),
		];
	}, [question]);

	const handleChange = (field: string, value: any) => {
		setPayload((state) => {
			return {
				...state,
				[field]: value,
			};
		});
	};

	useEffect(() => {
		setPayload({
			questionId: question?.id || '',
			answer: '',
		});
	}, [question?.id]);

	useEffect(() => {
		const isValid = !isNullOrEmpty(payload.questionId) && !isNullOrEmpty(payload.answer);

		onChange?.(payload, isValid);
	}, [payload]);

	return (
		<div className="flex justify-center">
			<Select
				label="Answer"
				options={answerOptions}
				required
				className="flex flex-col text-base w-full"
				onChange={(e) => {
					handleChange('answer', e.target.value);
				}}
			/>
		</div>
	);
}
