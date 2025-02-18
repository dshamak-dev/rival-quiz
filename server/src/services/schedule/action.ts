import { findSchedules } from "./api";
import { ScheduleStageEnum } from "./constants";
import { scheduleTotask } from "./helpers";
import { ScheduleTask } from "./types";

export async function loadScheduleTasks(): Promise<ScheduleTask[]> {
  return findSchedules({ stage: ScheduleStageEnum.ACTIVE }).then((res) => {
    return res?.map(scheduleTotask).filter((it) => it != null) || [];
  });
}

export function onTaskCompleted(task: ScheduleTask) {
  console.log(`Task ${task.id} completed`);
}
