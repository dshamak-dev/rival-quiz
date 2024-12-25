import { Icon, IconType } from '@view/icon';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { useState } from 'react';

export default function RoadmapPage() {
	const [items] = useState(getRoadmapItems() || []);

	return (
		<div className="min-h-full p-6 sm:p-12">
			<div className="relative flex flex-col items-center gap-16">
				{items.map((it, index) => {
					const dateLabel = it.date ? new Date(it.date).toLocaleDateString('en-US', {
						month: 'long',
						day: 'numeric',
						year: 'numeric',
					}) : 'TBA';
					const published = it.date && new Date() > new Date(it.date);

					return (
						<div key={index} className="w-full relative z-10 grid grid-cols-[80px_auto_1fr] sm:grid-cols-[1fr_auto_1fr] sm:justify-center gap-[32px]">
							<div className="text-right mt-1">{dateLabel}</div>
							<div className={classNames("relative z-10 w-[32px] h-[32px] rounded-full flex items-center justify-center", {
								'bg-black text-white': published || it.progress,
								'bg-amber-400 text-black': !published && !it.progress,
							})}>
								{it.icon && <Icon name={it.progress ? 'ArrowClockwise' : it.icon} size={16} className={classNames({
									'animate-spin text-amber-400': it.progress
								})} />}
							</div>
							<div>
								<Typography size="large" className="font-bold">
									{it.title}
								</Typography>
								<Typography>{it.description}</Typography>
							</div>
							{index < items.length - 1 && (
								<div className="z-0 w-0 absolute left-[128px] sm:left-[50%] top-[32px] -bottom-16 border-black border-r pointer-events-none" />
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

const getRoadmapItems = (): {
	date: string | null;
	title: string;
	description?: string;
	icon?: IconType;
	progress: boolean;
}[] => [
	{
		date: null,
		title: 'Add Single-Bet quiz',
		description: 'Design and Development',
		icon: 'PiggyBank',
		progress: false,
	},
	{
		date: null,
		title: 'Add Points System',
		description: 'Development',
		icon: 'Star',
		progress: false,
	},
	{
		date: '2024-12-30',
		title: 'Add Single Question No-Bet quiz',
		description: 'Create wireframes, design mockups, and finish development',
		icon: 'Question',
		progress: true,
	},
	{
		date: '2024-11-01',
		title: 'Add Profile Page',
		description: 'Wireframes, design, development',
		icon: 'Activity',
		progress: false,
	}
];
