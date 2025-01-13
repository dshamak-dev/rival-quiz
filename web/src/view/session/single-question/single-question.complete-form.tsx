import { SessionDTO } from '@model/session.model';
import { SingleQuestionSession } from '@model/session/single-question';
import { Select } from '@view/form/form.select';
import { useMemo } from 'react';

export type SingleQuestionCompleteFormProps = {
	session: SessionDTO;
};

export function SingleQuestionCompleteForm({ session }: SingleQuestionCompleteFormProps) {
	const question = useMemo(() => {
		return new SingleQuestionSession(session).getQuestionAt(0);
	}, [session]);
	const answerOptions = useMemo(() => {
		if (!question?.options?.length) {
			return [{
				label: 'No option available',
				value: '',
				disabled: true,
			}];
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

	return (
		<div className="flex justify-center">
			<Select label="Answer" options={answerOptions} required className="flex flex-col text-base w-full" />
		</div>
	);
}
