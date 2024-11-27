import { SessionStateType, SessionBetType } from '@model/session.model';
import { SelectOption } from '@view/form/form.select';

export const sessionStateLabels: Record<SessionStateType, string> = {
	[SessionStateType.Draft]: 'Draft',
	[SessionStateType.Published]: 'Published',
	[SessionStateType.Paused]: 'Paused',
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
