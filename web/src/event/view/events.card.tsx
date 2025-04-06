import { useMemo } from 'react';
import { EventDTO } from '../type';

import styles from './event.module.css';
import { Typography } from '@view/typography/typography';

export function EventCard({ item }: { item: EventDTO }) {
	const style = useMemo(() => {
		return {
			'--bg': item.mainColor,
			'--text': item.secondaryColor,
			'background-image': `url(${item.imageUrl})`,
		} as any;
	}, [item]);

	return (
		<div className={styles.card} style={style}>
			<div>
				<Typography type="h2">{item.title}</Typography>
				<Typography type="small" dangerouslySetInnerHTML={{ __html: item.description }}></Typography>
			</div>
		</div>
	);
}
