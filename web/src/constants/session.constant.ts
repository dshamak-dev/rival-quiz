import { SessionStateType, SessionBetType, SessionType, SessionTypes } from '@model/session.model';
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

export const sessionBetLabels: Record<SessionBetType, string> = {
	[SessionBetType.None]: 'No bets',
	[SessionBetType.Single]: 'Signle bet',
	[SessionBetType.Range]: 'Range bet value',
	[SessionBetType.Auction]: 'Auction',
};

export const sessionBetOptions: SelectOption[] = Object.entries(sessionBetLabels).map(([value, label]) => {
	return { label, value: Number(value) };
});

export const SESSION_TYPE_OPTIONS: { value: SessionTypes; icon: IconType; text: string; label: string; enabled: boolean }[] = [
	{
		icon: 'CashCoin',
		value: SessionTypes.USER_BET,
		text: 'Users are making bets',
		label: 'User Bets',
		enabled: true,
	},
	{
		icon: 'Bank',
		value: SessionTypes.SPONSOR,
		text: 'The creator pays the prize',
		label: 'Sponsorship',
		enabled: true,
	},
	{
		icon: 'People',
		value: SessionTypes.AUCTION,
		text: 'The winner gets the highest bid',
		label: 'Auction',
		enabled: false,
	},
];
