import { Typography } from '@view/typography/typography';
import { ABOUT_SECTIONS } from './data';

import styles from './about.module.css';

export default function AboutPage() {
	return (
		<div className={styles.container}>
			{ABOUT_SECTIONS.map((section, index) => {
				return (
					<section key={index}>
						<Typography type="h2">{section.title}</Typography>
						<Typography className={styles.sectionContent} dangerouslySetInnerHTML={{ __html: section.content }} />
					</section>
				);
			})}
		</div>
	);
}
