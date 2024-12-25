import { QuestionDTO } from '@model/question.model';
import { SessionDTO, SessionTypes } from '@model/session.model';
import { useAuth } from '@state/auth.hook';
import { Anchor } from '@view/anchor';
import { Button } from '@view/button/button';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';
import { useMemo } from 'react';
import { SessionViewSingleQuestion } from './session.view.single-question';
import { SessionContextProvider } from '@state/session.state';
import { SessionViewHeader } from './session.view.header';

export type SessionViewProps = { session: SessionDTO };

export function SessionView({ session }: SessionViewProps) {
	const { user } = useAuth();

	const question: QuestionDTO | null = useMemo(() => {
		return session.questions?.[0] || null;
	}, [session.questions]);

	const sessionStateContent = useMemo(() => {
		if (!user) {
			return (
				<div className="flex justify-center">
					<Anchor href={`/login?continue=${location.href}`}>
						<Button layout="tertiary" className="flex items-center gap-2 justify-center">
							<span className="text-sm">Login to Join</span>
							<Icon name="DoorClosed" size={14} className="" />
						</Button>
					</Anchor>
				</div>
			);
		}

		switch (session?.type) {
			case SessionTypes.Single: {
				return <SessionViewSingleQuestion />;
			}
			// case SessionStateType.Draft: {
			// 	return (
			// 		<div className="flex flex-col gap-8 items-center">
			// 			<Typography className="text-4xl font-bold text-center">Session is not started yet.</Typography>
			// 			<Button>Notify me</Button>
			// 		</div>
			// 	);
			// }
			default: {
				return (
					<div className="flex flex-col gap-8 items-center">
						<div>
							<Typography className="font-bold text-center text-2xl" size="custom">
								{question?.title}
							</Typography>
							{question?.description && (
								<Typography className="text-xs text-center">{question.description}</Typography>
							)}
						</div>
						<div>
							<Typography className="text-2xl font-bold text-center">To be continue...</Typography>
						</div>
					</div>
				);
			}
		}
	}, [session, question]);

	return (
		<SessionContextProvider value={session}>
			<div className="grid grid-rows-[auto_1fr_auto] gap-2 w-full">
				<SessionViewHeader />
				<div style={{ minWidth: 'min(50vw, 100%)', maxWidth: '100%' }} className="w-fit mx-auto p-6 mt-[12vh]">
					{sessionStateContent}
				</div>
			</div>
		</SessionContextProvider>
	);
}
