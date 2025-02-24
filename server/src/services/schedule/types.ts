import { ID } from "@shared/common/model";
import { ScheduleActionEnum, ScheduleStageEnum } from "./constants";

export type Schedule = {
  id: ID;
  stage: ScheduleStageEnum;
  action: ScheduleActionEnum;
  startAt: string;
  endAt: string;
  data: Record<string, any>;
  metadata: Record<string, any>;
  history: Record<string, any>[];
};

export type ScheduleTask = {
  id: ID;
  scheduleId: ID;
  cronTime: string;
  data: Schedule;
};
