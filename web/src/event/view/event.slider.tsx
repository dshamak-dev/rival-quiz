import { EventDTO } from '../type';
import { EventCard } from './events.card';

import styles from './event.module.css';

export function EventsSlider({ items }: { items: EventDTO[] }) {
	return (
		<div className={styles.slider}>
			{items?.map((item, index) => (
				<EventCard key={index} item={item} />
			))}
		</div>
	);
}
