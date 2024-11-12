import { QuestionDTO } from '@model/question.model';
import { Button } from '@view/button/button';
import { TextInput } from '@view/form/form.text-input';
import { useMemo, useState } from 'react';

export type QuestionFormProps = {
	initialValue: QuestionDTO;
};

export function QuestionForm({ initialValue }: QuestionFormProps) {
	const [formState, setFormState] = useState({ ...initialValue });

	const isDirty = useMemo(() => {
		return JSON.stringify(initialValue) !== JSON.stringify(formState);
	}, [formState]);

	const canSave = useMemo(() => {
		return isDirty;
	}, [isDirty]);

	const handleChange = (name: string, value: any) => {
		setFormState((state) => {
			return { ...state, [name]: value };
		});
	};

	const handleCancel = () => {
		const _state = { ...initialValue };

		setFormState(_state);
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex flex-col gap-4 p-4">
				<TextInput
					id="title"
					label="title"
					value={formState?.title || ''}
					onChange={(e, value) => handleChange(e.target.id, value)}
				/>
				<TextInput
					id="description"
					label="description"
					value={formState?.description || ''}
					onChange={(e, value) => handleChange(e.target.id, value)}
				/>
			</div>
			<div className="flex justify-end gap-4">
				<Button layout="primary" size="small" disabled={!canSave} className="min-w-[100px]">
					Save
				</Button>
				<Button size="small" disabled={!isDirty} className="min-w-[100px]" onClick={handleCancel}>
					Cancel
				</Button>
			</div>
		</div>
	);
}
