import { SessionStateType } from '@model/session.model';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';
import { useMemo } from 'react';
import { useSession } from '@state/session.state';
import classNames from 'classnames';
import { useAPI } from '@api/api.hook';
import { findSessionById } from '@api/session.api';

// TODO: Implement actual progress tracking and state updates
const progressBar = {
	stages: [
		{
			label: 'Waiting for answers...',
		},
		{
			label: 'Waiting for people...',
		},
		{
			label: 'Waiting for results...',
		},
		{
			label: 'Results',
		},
	],
};

export function SessionViewHeader() {
	const { session, userProgress = 0, dispatch } = useSession();
	const { loading, dispatch: fetchSession } = useAPI({
		initialState: null,
		request: (id: string) => findSessionById(id),
		minDuration: 1000,
	});

	const stageIndex = useMemo(() => {
		switch (session?.state) {
			case SessionStateType.Locked:
				return Math.max(2, userProgress);
			case SessionStateType.Published:
			case SessionStateType.Draft:
			default:
				return Math.max(0, userProgress);
		}
	}, [session?.state, userProgress]);

	if (!session) {
		return null;
	}

	return (
		<div className="flex flex-col gap-2 w-full">
			<div className="grid grid-cols-[1fr_auto] gap-4 items-center">
				<div>
					<Typography className="text-lg" size="custom">
						{session.title}
					</Typography>
					{session.description && <Typography className="text-xs">{session.description}</Typography>}
				</div>
				<div
					className="p-2 cursor-pointer opacity-50 hover:opacity-100"
					onClick={() => {
						fetchSession(session.id).then((res) => {
							dispatch?.({ type: 'SET_SESSION', payload: res });
						});
					}}
				>
					<Icon
						name="ArrowClockwise"
						size={24}
						className={classNames({
							'animate-spin': loading,
						})}
					/>
				</div>
			</div>
			<div
				className={classNames(`grid gap-6`)}
				style={{
					gridTemplateColumns: `repeat(${progressBar.stages.length}, 1fr)`,
				}}
			>
				{progressBar.stages.map((it, index) => {
					const isPassed = index < stageIndex;
					const isActive = index === stageIndex;
					const isNext = index === stageIndex + 1;

					return (
						<div
							className={classNames('relative h-3 w-full rounded-md border', {
								'bg-black': isPassed || isActive,
								'text-black': isActive,
								'text-gray-400': isNext,
								'text-transparent': !isActive && !isNext,
							})}
						>
							<Typography className="relative -bottom-3 text-center text-sm pointer-events-none">
								{it.label}
							</Typography>
						</div>
					);
				})}
			</div>
			{/* <Progress
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
			/> */}
		</div>
	);
}
