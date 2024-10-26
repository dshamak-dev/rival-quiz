import { Typography } from "@view/typography/typography";

import styles from './email.styles.module.css'
import { LocalEmail } from "@control/email/email.contol";

type EmailPreviewProps = {
	item: LocalEmail;
};

export function EmailPreview({ item }: EmailPreviewProps) {
	return (
		<div className={styles['preview-container']}>
			<Typography type='h2'>{item.subject}</Typography>
			<div className='flex flex-col gap-2' dangerouslySetInnerHTML={{ __html: item.body }}></div>
		</div>
	);
}
