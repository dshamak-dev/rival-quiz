export type EventDTO = {
	imageUrl: string;
	mainColor?: string;
	secondaryColor?: string;
	title: string;
	location: 'Global';
	date: Date | string | number;
	description: string;
};
