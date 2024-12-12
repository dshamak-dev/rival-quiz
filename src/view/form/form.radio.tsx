import { Icon, IconType } from '@view/icon';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { PropsWithoutRef, useMemo } from 'react';
import { SelectOption } from './form.select';

export type RadioListProps = PropsWithoutRef<any> & {
	icons?: { active: IconType; inactive: IconType };
	value?: string | number | boolean;
	items: SelectOption[];
	onChange?: (value: string | number) => void;
	disabled?: boolean;
};
export function RadioList({ items, onChange, icons, value, className, disabled, ...other }: RadioListProps) {
	return (
		<div className={classNames('flex flex-col gap-4', className)}>
			{items.map(({ label, disabled: itemDisabled, value: itemValue }, index) => {
				const isSelected = itemValue === value;
				let isDisabled = itemDisabled;

				if (!isDisabled && !isSelected) {
					isDisabled = disabled;
				}

				return (
					<RadioInput
						key={itemValue}
						icons={icons}
						onClick={() => {
							if (disabled) {
								return;
							}
							onChange?.(itemValue);
						}}
						selected={isSelected}
						disabled={isDisabled}
					>
						{label}
					</RadioInput>
				);
			})}
		</div>
	);
}

export type RadioInputProps = PropsWithoutRef<any> & {
	icons?: { active: IconType; inactive: IconType };
	selected?: boolean;
};

export function RadioInput({ icons, children, selected, className, disabled, ...other }: RadioInputProps) {
	const icon = useMemo(() => {
		if (selected) {
			return icons?.active || 'RecordCircle';
		}

		return icons?.inactive || 'Circle';
	}, [icons, selected]);

	return (
		<div
			{...other}
			className={classNames(
				'grid grid-cols-[auto_1fr] gap-4',
				{
					'text-gray-400 cursor-default': disabled,
					'cursor-pointer': !disabled, 		
				},
				className
			)}
		>
			<Icon name={icon} size={24} />
			<Typography className="text-left">{children}</Typography>
		</div>
	);
}
