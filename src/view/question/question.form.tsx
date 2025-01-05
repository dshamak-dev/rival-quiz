import { QuestionDTO } from '@model/question.model';
import { Button } from '@view/button/button';
import { TextInput } from '@view/form/form.text-input';
import { useMemo, useState } from 'react';
import { QuestionOptionsForm } from './question.options-form';
import { FormLabel } from '@view/form/form.label';

export type QuestionFormProps = {
	initialValue: QuestionDTO;
	onSubmit?: (question: QuestionDTO) => void;
	disabled?: boolean;
	onDelete?: () => void;
};

export function QuestionForm({ initialValue, disabled, onSubmit, onDelete }: QuestionFormProps) {
	const [formState, setFormState] = useState({ ...initialValue });

	const isDirty = useMemo(() => {
		return JSON.stringify(initialValue) !== JSON.stringify(formState) && !disabled;
	}, [formState, disabled]);

	const check = useMemo(() => {
		const errors: any[] = [];

		['title'].forEach((field: string) => {
			const value = (formState as any)[field];

			if (!value || value === '') {
				errors.push({ field, message: 'Field is required.' });
			}
		});

		return { isValid: !errors?.length, errors };
	}, [formState]);

	const canSave = useMemo(() => {
		return (isDirty && !disabled) || !check.isValid;
	}, [isDirty, disabled, check]);

	const handleChange = (name: string, value: any) => {
		setFormState((state) => {
			return { ...state, [name]: value };
		});
	};

	const handleCancel = () => {
		const _state = { ...initialValue };

		setFormState(_state);
	};

	const handleSubmit = () => {
		if (onSubmit) {
			onSubmit(formState);
		}
	};

	const handleOptionsChange = (options: QuestionDTO['options']) => {
		setFormState((state) => {
			return { ...state, options };
		});
	};

	const handleDelete = () => {
		if (onDelete) {
			onDelete();
		}
	};

	return (
		<div className="flex flex-col gap-4 p-4" data-id={initialValue?.id}>
			<div className="flex flex-col gap-4">
				<TextInput
					id="title"
					label="title"
					value={formState?.title}
					defaultValue={initialValue?.title || ''}
					onChange={(e, value) => handleChange(e.target.name, value)}
					disabled={disabled}
				/>
				<TextInput
					id="description"
					label="description"
					value={formState?.description || ''}
					defaultValue={initialValue?.description || ''}
					onChange={(e, value) => handleChange(e.target.name, value)}
					disabled={disabled}
				/>
			</div>
			<div>
				<QuestionOptionsForm disabled={disabled} answer={formState.answer} options={formState?.options} onChange={handleOptionsChange} />
			</div>
			<div className="flex justify-end gap-4">
				{onDelete && (
					<Button disabled={disabled} size="small" onClick={handleDelete}>
						Delete
					</Button>
				)}
				<Button size="small" disabled={!isDirty} className="min-w-[100px]" onClick={handleCancel}>
					Cancel
				</Button>
				<Button
					layout="primary"
					size="small"
					disabled={!canSave}
					className="min-w-[100px]"
					onClick={handleSubmit}
				>
					Save
				</Button>
			</div>
		</div>
	);
}
