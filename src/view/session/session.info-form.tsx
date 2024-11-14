import { Session, SessionDTO } from '@model/session.model';
import { Button } from '@view/button/button';
import { FormLabel } from '@view/form/form.label';
import { Select } from '@view/form/form.select';
import { TextInput } from '@view/form/form.text-input';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';
import { useEffect, useMemo, useState } from 'react';
import { sessionStateLabels, sessionStateOptions } from 'src/constants/session.constant';

export type SessionInfoFormProps = {
	initialValue: Session;
	onSubmit: (session: Session) => void;
	disabled?: boolean;
};

export function SessionInfoForm({ initialValue, onSubmit, disabled }: SessionInfoFormProps) {
	const [formState, setFormState] = useState({ ...initialValue });

	const isDirty = useMemo(() => {
		return JSON.stringify(initialValue) !== JSON.stringify(formState);
	}, [formState]);

	const canSave = useMemo(() => {
		return isDirty && !disabled;
	}, [isDirty, disabled]);

	const handleChange = (name: string, value: any) => {
		setFormState((state) => {
			return { ...state, [name]: value };
		});
	};

	const handleCancel = () => {
		const _state = { ...initialValue };

		setFormState(_state);
	};

	useEffect(() => {
		setFormState(initialValue);
	}, [initialValue]);

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center gap-2">
				<Icon name="InfoSquareFill" />
				<div className="flex items-center gap-1">
					<Typography className="text-black">{sessionStateLabels[formState.state]}</Typography>
				</div>
			</div>
			<TextInput
				id="title"
				label="title"
				value={formState?.title}
				defaultValue={initialValue?.title || ''}
				onChange={(e, value) => handleChange(e.target.name, value)}
			/>
			<TextInput
				id="description"
				label="description"
				value={formState?.description}
				defaultValue={initialValue?.description || ''}
				onChange={(e, value) => handleChange(e.target.name, value)}
			/>
			{/* <Select id="state" label="state" disabled options={sessionStateOptions} defaultValue={formState.state} /> */}

			<div className="flex justify-end gap-4">
				<Button
					layout="primary"
					size="small"
					className="min-w-[100px]"
					disabled={!canSave}
					onClick={() => onSubmit(formState)}
				>
					Save
				</Button>
				<Button size="small" className="min-w-[100px]" disabled={!isDirty || disabled} onClick={handleCancel}>
					Cancel
				</Button>
			</div>
		</div>
	);
}
