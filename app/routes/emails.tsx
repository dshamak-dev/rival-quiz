import { getLocalEmails, LocalEmail, setLocalEmails } from '@control/email.contol';
import { formatDate } from '@control/date.control';
import { MetaFunction } from '@remix-run/node';
import { EmailPreview } from '@view/email/email.preview';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';

export const meta: MetaFunction = () => {
	return [{ title: 'Local Cahshed Emails' }];
};

export default function AcceptInvitePage() {
	const [emails, setEmails] = useState<LocalEmail[]>([]);
	const [selectedEmailIndex, setSelectedEmailIndex] = useState(-1);

	const selectedEmail = useMemo(() => {
		return selectedEmailIndex >= 0 ? emails[selectedEmailIndex] : null;
	}, [selectedEmailIndex]);

	const handleEmailClick = (email: LocalEmail, index: number) => {
		setSelectedEmailIndex(index);
	};

	const handleRemoveEmail = (index: number) => {
		const otherEmails = emails.filter((_, i) => i!== index);

		setLocalEmails(otherEmails);

        setEmails(otherEmails);
    };

	useEffect(() => {
		setEmails(getLocalEmails().reverse());
	}, []);

	return (
		<div className='max-h-full h-screen grid grid-rows-[auto_1fr]'>
			<div className='h-full w-full overflow-hidden grid grid-cols-[25vw_1fr]'>
				<div className='flex flex-col gap-4 px-4 border-r'>
					<Typography type='h2'>Local Emails</Typography>
					{emails.map((email, index) => {
						const selected = index === selectedEmailIndex;

						return (
							<div
								key={index}
								onClick={() => handleEmailClick(email, index)}
								className={classNames('relative h-fit p-2 rounded', {
									'bg-gray-100 cursor-pointer hover:bg-sky-200': !selected,
									'bg-amber-200 cursor-default': selected,
								})}
							>
								<Typography>{email.subject}</Typography>
								<div onClick={(e) => {
									e.stopPropagation();
									handleRemoveEmail(index);
								}} className='absolute top-2 right-2 p-2 rounded-full bg-black text-white text-xs cursor-pointer hover:bg-red-600'>
									<Icon name='Trash' />
								</div>
								<div>
									<Typography className='text-xs'>From: {email.from}</Typography>
									<Typography className='text-xs'>To: {email.to}</Typography>
									<Typography className='text-xs'>{formatDate(email.createdAt)}</Typography>
								</div>
							</div>
						);
					})}
				</div>
				<div className='px-4'>
					{selectedEmail ? <EmailPreview item={selectedEmail} /> : <Typography>No email selected</Typography>}
				</div>
			</div>
		</div>
	);
}
