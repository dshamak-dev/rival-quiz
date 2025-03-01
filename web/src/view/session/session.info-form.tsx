import { compareObjects } from '@control/object.utils';
import { SessionDTO, SessionStateType, SessionTypes } from '@model/session.model';
import { Button } from '@view/button/button';
import { Select } from '@view/form/form.select';
import { TextInput } from '@view/form/form.text-input';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';
import { useEffect, useMemo, useState } from 'react';
import { sessionBetOptions, sessionStateLabels } from 'src/constants/session.constant';

export type SessionInfoFormProps = {
	initialValue: SessionDTO;
	onSubmit: (session: SessionDTO) => void;
	disabled?: boolean;
};

export function SessionInfoForm({ initialValue, onSubmit, disabled }: SessionInfoFormProps) {
	const [formState, setFormState] = useState({ ...initialValue });

	const isDirty = useMemo(() => {
		return JSON.stringify(initialValue) !== JSON.stringify(formState);
	}, [formState]);

	const state = formState.state || SessionStateType.Draft;

	// const canSave = useMemo(() => {
	// 	return (
	// 		(isDirty && !disabled) ||
	// 		[SessionStateType.Archived, SessionStateType.Completed, SessionStateType.Canceled].includes(state)
	// 	);
	// }, [isDirty, disabled, state]);

	const handleChange = (name: string, value: any) => {
		setFormState((state) => {
			return { ...state, [name]: value };
		});
	};

	const handleChangeSettings = (name: string, value: any) => {
		setFormState((state) => {
			return { ...state, settings: { ...state.settings, [name]: value } };
		});
	};

	const handleCancel = () => {
		const _state = { ...initialValue };

		setFormState(_state);
	};

	useEffect(() => {
		setFormState(initialValue);
	}, [initialValue]);

	const handleSubmit = () => {
		if (!compareObjects(formState, initialValue)) {
			onSubmit(formState);
		}
	};

	const isSponsored = useMemo(() => {
		return formState?.type === SessionTypes.SPONSOR;
	}, [formState?.type]);

	const canEdit = useMemo(() => {
		return !disabled && [SessionStateType.Draft].includes(state);
	}, [disabled, state]);

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center gap-2">
				<Icon name="InfoSquareFill" />
				<div className="flex items-center gap-1">
					<Typography className="text-black">{sessionStateLabels[formState.state]}</Typography>
				</div>
			</div>
			<div className="flex gap-4">
				<TextInput
					id="title"
					label="title"
					disabled={!canEdit}
					value={formState?.title}
					defaultValue={initialValue?.title || ''}
					onChange={(e, value) => handleChange(e.target.name, value)}
					onBlur={(e) => handleSubmit()}
					className="flex-grow"
				/>
				{isSponsored && (
					<div>
						<TextInput
							id="pool"
							label="Prize Pool"
							disabled={!canEdit}
							type="number"
							value={String(formState?.settings?.pool ?? '')}
							defaultValue={String(initialValue?.settings?.pool || '')}
							onChange={(e, value) => handleChangeSettings(e.target.name, value)}
							onBlur={(e) => handleSubmit()}
						/>
					</div>
				)}
			</div>
			<TextInput
				id="description"
				label="description"
				disabled={!canEdit}
				value={formState?.description}
				defaultValue={initialValue?.description || ''}
				onChange={(e, value) => handleChange(e.target.name, value)}
				onBlur={(e) => handleSubmit()}
			/>
			<TextInput
				id="image"
				label="Preview URL"
				value={formState?.image || ''}
				defaultValue={initialValue?.image || ''}
				onChange={(e, value) => handleChange(e.target.name, value)}
				onBlur={(e) => handleSubmit()}
				disabled={!canEdit}
			/>
			{/* <Select
				id="bet-type"
				label="Bet Type"
				disabled={![SessionStateType.Draft, SessionStateType.Published].includes(state)}
				options={sessionBetOptions}
				defaultValue={formState.betType}
				className="flex flex-col"
			/> */}

			{/* Hide to allow auto-save  */}
			{/* <div className="flex justify-end gap-4">
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
			</div> */}
		</div>
	);
}
