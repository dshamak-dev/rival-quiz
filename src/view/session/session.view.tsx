import { SessionDTO, SessionStateType } from '@model/session.model';
import { useAuth } from '@state/auth.hook';
import { Anchor } from '@view/anchor';
import { Button } from '@view/button/button';
import { Icon } from '@view/icon';
import { Progress } from '@view/progress/progress';
import { Typography } from '@view/typography/typography';
import { useMemo } from 'react';

export type SessionViewProps = { session: SessionDTO };

export function SessionView({ session }: SessionViewProps) {
	const { user } = useAuth();

	const progressState = useMemo(() => {
		switch (session.state) {
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

	const question = useMemo(() => {
		return {
			title: 'What is the most popular color in the world?',
			options: ['Red', 'Blue', 'Green', 'Yellow'],
			answer: 'Blue',
		};
	}, []);

	const sessionStateContent = useMemo(() => {
		if (!user) {
			return (
				<div>
					<Anchor href={`/login?continue=${location.href}`}>
						<Button layout="tertiary" className="flex items-center gap-2 justify-center">
							<span className="text-sm">Login to Join</span>
							<Icon name="DoorClosed" size={14} className="" />
						</Button>
					</Anchor>
				</div>
			);
		}

		switch (session.state) {
			case SessionStateType.Published: {
				return (
					<div className="flex flex-col gap-8 items-center">
						<Typography className="text-4xl font-bold">{question.title}</Typography>
						<select className="w-full border px-2 py-2 rounded">
							<option disabled>Select An Option</option>
							{question.options.map((it, index) => {
								return (
									<option key={index} value={it}>
										{it}
									</option>
								);
							})}
						</select>
						<Button>Confirm answer</Button>
					</div>
				);
			}
			case SessionStateType.Draft:
			default: {
				return (
					<div className="flex flex-col gap-8 items-center">
						<Typography className="text-4xl font-bold text-center">Session is not started yet.</Typography>
						<Button>Notify me</Button>
					</div>
				);
			}
		}
	}, [session, question]);

	return (
		<div className="grid grid-rows-[auto_1fr_auto] gap-2 w-full">
			<div className="flex flex-col gap-2 w-full">
				<Typography className="">{session.title}</Typography>
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
			<div style={{ minWidth: 'min(50vw, 100%)', maxWidth: '100%' }} className="w-fit mx-auto p-6 mt-[12vh]">
				{sessionStateContent}
			</div>
		</div>
	);
}
