import { QuestionDTO } from '@model/question.model';
import { SessionDTO, SessionStateType } from '@model/session.model';
import { useAuth } from '@state/auth.hook';
import { Anchor } from '@view/anchor';
import { Button } from '@view/button/button';
import { Icon } from '@view/icon';
import { Progress } from '@view/progress/progress';
import { Typography } from '@view/typography/typography';
import { useMemo } from 'react';
import { SessionViewPublished } from './session.view.state-published';
import { SessionContextProvider, useSession } from '@state/session.state';

export function SessionViewHeader() {
	const { session } = useSession();

	const progressState = useMemo(() => {
		switch (session?.state) {
			case SessionStateType.Published:
				return {
					label: 'Waiting for people...',
					value: 10,
				};
			case SessionStateType.Draft:
			default:
				return {
					label: 'Session is not started',
					value: 2,
				};
		}
	}, [session?.state]);

	if (!session) {
		return null;
	}

	return (
		<div className="flex flex-col gap-2 w-full">
			<Typography className="text-lg">{session.title}</Typography>
			{session.description && <Typography className="text-xs">{session.description}</Typography>}
			<Progress
				className="h-[8px] w-full"
				value={progressState.value}
				max="100"
				prefix={<Typography className="text-sm">{progressState.label}</Typography>}
				postfix={
					<div className="flex gap-2 items-center">
						<span>0</span>
						<Icon name="People" size={16} />
					</div>
				}
			/>
		</div>
	);
}
