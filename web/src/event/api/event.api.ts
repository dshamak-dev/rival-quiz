import { EventDTO } from '../type';

export async function fetchHighlightEvents(): Promise<EventDTO[]> {
	return [
		{
			// imageUrl: '/assets/events/event-1.jpg',
			imageUrl: 'https://i.pinimg.com/736x/76/a0/bd/76a0bd29520aa11fb8792ed91bc6da77.jpg',
			mainColor: '#faf9d9',
			secondaryColor: '#212121',
			title: 'Beta test coming soon',
			location: 'Global',
			date: '01.05.2025',
			description:
				'The Beta test will be available for limited access.<br />Be the first to join and experience new features and updates.',
		},
	];
}
