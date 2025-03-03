export enum SessionStateType {
	Draft = 0,
	Published = 1,
	Active = 2,
	Canceled = 3,
	Archived = 4,
	Locked = 5,
	LockedForReview = 6,
	Completed = 7,
}

export enum SessionTypes {
	Single = 'single',
	Multiple = 'multiple',
	Range = 'range',
	Lottery = 'lottery',
}
