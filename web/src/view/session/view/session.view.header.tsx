import { ProgressStage, SessionStateType } from '@model/session.model';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';
import { useEffect, useMemo } from 'react';
import { useSession } from '@state/session.state';
import classNames from 'classnames';
import { useAPI } from '@api/api.hook';
import { findSessionById } from '@api/session.api';
import { useAuth } from '@state/auth.hook';
import { useNavigate } from '@remix-run/react';
import { fetchSessionUpdateState } from 'src/session/api';
import { useWallet } from 'src/wallet/state';
import { Image } from '@view/image/image';

import sessionPlaceholderImage from '@assets/placeholders/p_01.png';

// TODO: Implement actual progress tracking and state updates
const progressBar = {
	stages: [
		// ProgressStage.Lobby
		{
			label: 'Waiting for participants',
		},
		// ProgressStage.Question
		{
			label: 'Give an answer',
		},
		// ProgressStage.Pending
		{
			label: 'Waiting for people to answer',
		},
		// ProgressStage.Processing
		{
			label: 'Waiting for results...',
		},
		// ProgressStage.Summary
		{
			label: 'Stage Summary',
		},
	],
};

const MS_IN_SEC = 1000;
const MS_IN_MIN = 60 * MS_IN_SEC;
const SESSION_UPDATE_CHECK_INTERVAL = 0.5 * MS_IN_MIN;

export function SessionViewHeader() {
	const { session, userProgress = 0, updateRequested, dispatch } = useSession();
	const { user } = useAuth();
	const { fetch: fetchWallet } = useWallet();
	const natigate = useNavigate();
	const { loading, dispatch: fetchSession } = useAPI({
		initialState: null,
		request: (id: string) =>
			findSessionById(id).then((res) => {
				if (res) {
					dispatch?.({ type: 'SET_SESSION', payload: res });
				}
			}),
		minDuration: 1000,
	});

	const { loading: isCheckingUpdates, dispatch: checkUpdates } = useAPI({
		initialState: null,
		request: (date: string | number) => {
			return session ? fetchSessionUpdateState(session.id, date) : Promise.reject(false);
		},
	});

	useEffect(() => {
		if (
			!session?.updatedAt ||
			isCheckingUpdates ||
			[SessionStateType.Completed, SessionStateType.Canceled, SessionStateType.Archived].includes(session.state)
		) {
			return;
		}

		const lastUpdatedAt = [session.questionData?.updatedAt, session.updatedAt].sort((a, b) => {
			const aTime = a ? new Date(a as string).getTime() : 0;
			const bTime = b ? new Date(b as string).getTime() : 0;

			return bTime - aTime;
		})[0];

		const timeout = setTimeout(() => {
			checkUpdates(lastUpdatedAt).then((hasUpdates) => {
				if (hasUpdates) {
					fetchSession(session.id);
				}
			});
		}, SESSION_UPDATE_CHECK_INTERVAL);

		return () => clearTimeout(timeout);
	}, [session?.updatedAt, session?.questionData?.updatedAt, isCheckingUpdates]);

	useEffect(() => {
		if (
			session?.state &&
			[
				SessionStateType.Locked,
				SessionStateType.LockedForReview,
				SessionStateType.Completed,
				SessionStateType.Canceled,
			].includes(session.state)
		) {
			fetchWallet();
		}
	}, [session?.state]);

	useEffect(() => {
		if (updateRequested && !isCheckingUpdates && session?.id) {
			fetchSession(session.id);
		}
	}, [updateRequested]);

	const progressBarStages = useMemo(() => {
		switch (session?.state) {
			case SessionStateType.Published:
			case SessionStateType.Draft:
			case SessionStateType.Active:
			case SessionStateType.Locked:
			case SessionStateType.LockedForReview:
				return progressBar.stages;
			case SessionStateType.Canceled:
			case SessionStateType.Archived:
			case SessionStateType.Completed:
				return [
					{
						label: 'Session Summary',
					},
				];
			default:
				return [];
		}
	}, [session?.state]);

	const questionProgressLabel = useMemo(() => {
		if (session?.state !== SessionStateType.Active) {
			return null;
		}
		const userCount = session?.users?.length || 0;
		const votesCount = session?.questionData?.metadata?.votesCount || 0;

		if (!userCount) {
			return null;
		}

		return `Ready (${votesCount} / ${userCount})`;
	}, [session?.state, session?.questionData]);

	const stageIndex = useMemo(() => {
		const stagesLength = progressBarStages.length;
		let progressStageIndex = 0;

		switch (session?.state) {
			case SessionStateType.Draft:
			case SessionStateType.Published:
				progressStageIndex = Math.max(ProgressStage.Lobby, userProgress);
				break;
			case SessionStateType.Active:
				progressStageIndex = Math.max(ProgressStage.Question, userProgress);
				break;
			case SessionStateType.Locked:
				progressStageIndex = Math.max(ProgressStage.Processing, userProgress);
				break;
			case SessionStateType.LockedForReview:
				progressStageIndex = Math.max(ProgressStage.Summary, userProgress);
				break;
			default:
				progressStageIndex = 0;
		}

		return Math.min(stagesLength - 1, progressStageIndex);
	}, [session?.state, userProgress, progressBarStages]);

	const isSessionAdmin = useMemo(() => {
		return user?.id === session?.ownerId;
	}, [user?.id, session?.ownerId]);

	if (!session) {
		return null;
	}

	return (
		<div className="relative z-10 flex flex-col gap-2 w-full">
			<div className="grid grid-cols-[1fr_auto] gap-4 items-center">
				<div className="flex items-center gap-4">
					{session.image !== null && <Image className="h-12 object-contain object-top" src={session.image || sessionPlaceholderImage} />}
					<div>
						<Typography className="text-lg" size="custom">
							{session.title}
						</Typography>
						{session.description && <Typography className="text-xs">{session.description}</Typography>}
					</div>
				</div>
				<div className="flex items-center gap-2">
					{isSessionAdmin && (
						<div
							className="p-2 cursor-pointer opacity-50 hover:opacity-100"
							onClick={() => {
								natigate(`/profile/sessions/${session.id}`);
							}}
						>
							<Icon name="Pencil" size={18} />
						</div>
					)}
					<div
						className="p-2 cursor-pointer opacity-50 hover:opacity-100"
						onClick={() => {
							fetchSession(session.id);
						}}
					>
						<Icon
							name="ArrowClockwise"
							size={18}
							className={classNames({
								'animate-spin': loading,
							})}
						/>
					</div>
				</div>
			</div>
			<div>
				{questionProgressLabel && (
					<Typography className="text-sm text-center">{questionProgressLabel}</Typography>
				)}
				<div
					className={classNames(`grid gap-2 sm:gap-6`)}
					style={{
						gridTemplateColumns: `repeat(${progressBarStages.length}, 1fr)`,
					}}
				>
					{progressBarStages.map((it, index) => {
						const isPassed = index < stageIndex;
						const isActive = index === stageIndex;
						// TODO: Implement progress tracking and next state preview
						const isNext = false; //index === stageIndex + 1;

						return (
							<div
								key={index}
								className={classNames('relative flex justify-center h-3 w-full rounded-md border', {
									'bg-black': isPassed || isActive,
									'text-black': isActive,
									'text-gray-400': isNext,
									'text-transparent': !isActive && !isNext,
								})}
							>
								<Typography
									className={classNames(
										'absolute -bottom-6 text-nowrap text-center text-sm pointer-events-none',
										{
											'left-0': index === 0,
											'right-0': index === progressBar.stages.length - 1,
										}
									)}
								>
									{it.label}
								</Typography>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
