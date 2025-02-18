import { Schedule, ScheduleTask } from "./types";

export function normalize(dto): Schedule | null {
	return dto?.json;
}

export function scheduleTotask(schedule): ScheduleTask | null {
	const cronTime = schedule.repeatRule;

	return {
		id: schedule.id,
        scheduleId: schedule.id,
        cronTime: cronTime,
        data: schedule,
	};
}