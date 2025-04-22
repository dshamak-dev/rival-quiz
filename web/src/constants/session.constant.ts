import { SessionStateType, SessionTypes } from '@model/session.model';
import { SelectOption } from '@view/form/form.select';
import { IconType } from '@view/icon';

export const sessionStateLabels: Record<SessionStateType, string> = {
	[SessionStateType.Draft]: 'Draft',
	[SessionStateType.Published]: 'Published',
	[SessionStateType.Active]: 'Active',
	[SessionStateType.Canceled]: 'Canceled',
	[SessionStateType.Archived]: 'Archived',
	[SessionStateType.Locked]: 'Locked',
	[SessionStateType.LockedForReview]: 'Locked for Review',
	[SessionStateType.Completed]: 'Completed',
};

export const sessionStateOptions: SelectOption[] = Object.entries(sessionStateLabels).map(([value, label]) => {
	return { label, value: Number(value) };
});

export const sessionTypeLabels: Record<SessionTypes, string> = {
	[SessionTypes.USER_BET]: 'Bets',
	[SessionTypes.SPONSOR]: 'Sponsor',
	[SessionTypes.SYSTEM_PRIZE]: 'System Prize',
	[SessionTypes.LOTTERY]: 'Lottery',
	[SessionTypes.CUSTOM]: 'Custom',
};

export const SESSION_TYPE_OPTIONS: {
	value: SessionTypes;
	icon: IconType;
	text: string;
	label: string;
	enabled: boolean;
}[] = [
	{
		icon: 'CashCoin',
		value: SessionTypes.USER_BET,
		text: 'Users are making bets',
		label: 'Bets',
		enabled: true,
	},
	{
		icon: 'PersonHearts',
		value: SessionTypes.SPONSOR,
		text: 'The creator is drawing the prize',
		label: 'Sponsorship',
		enabled: false,
	},
	{
		icon: 'Shuffle',
		value: SessionTypes.LOTTERY,
		text: 'A random winner is chosen',
		label: 'Lottery',
		enabled: false,
	},
	{
		icon: 'CurrencyExchange',
		value: SessionTypes.CUSTOM,
		text: 'Self Made Casino',
		label: 'Casino',
		enabled: false,
	},
];
