import { formatDate } from '@control/date.control';
import { useEffect, useState } from 'react';

type Props = {
	due: Date | string | number;
	// @prop-type: 'days' | 'hours' |'minutes' |'seconds'
	stepType?: 'days' | 'hours' | 'minutes' | 'seconds';
	stepValue?: number;
};
export function Countdown({ due, stepType = 'minutes', stepValue = 1 }: Props) {
	const [countdown, setCountdown] = useState<number | null>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			const remainingTime = calculateRemainingTime(due);

			if (remainingTime <= 0) {
				clearInterval(interval);
				setCountdown(null);
			} else {
				setCountdown(remainingTime);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [due]);

	if (!countdown) {
		return null;
	}

	// const diff = calculateRemainingTime(countdown);
	const time = timeToDuration(countdown);

	return time;
}

function calculateRemainingTime(due: Date | string | number): number {
	const currentTime = new Date().getTime();
	const dueTime = new Date(due).getTime();

	return dueTime - currentTime;
}

// function calculateDifference(remainingTime: number, stepType: 'days' | 'hours' | 'minutes' | 'seconds'): number {
// 	switch (stepType) {
// 		case 'days':
// 			return Math.floor(remainingTime / (60 * 60 * 24));
// 		case 'hours':
// 			return Math.floor(remainingTime / (60 * 60));
// 		case 'minutes':
// 			return Math.floor(remainingTime / 60);
// 		case 'seconds':
// 			return remainingTime;
// 		default:
// 			return 0;
// 	}
// }

function timeToDuration(timeMS: number): string {
	const time = Math.floor(timeMS / 1000);

	if (time <= 0) {
		return '0s';
	}

	const days = Math.floor(time / (60 * 60 * 24));
	const hours = Math.floor((time % (60 * 60 * 24)) / (60 * 60));
	const minutes = Math.floor((time % (60 * 60)) / 60);
	const seconds = time % 60;

	return `${days ? `${days}d ` : ''}${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m ` : ''}${seconds}s`;
}
