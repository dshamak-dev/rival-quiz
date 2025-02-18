import mongoose from "mongoose";
import * as dbUtils from "../../database/database.utils";
import { ScheduleActionEnum, ScheduleStageEnum } from "./constants";

const schema = new mongoose.Schema(
  {
    stage: {
      type: ScheduleStageEnum,
      required: true,
      default: ScheduleStageEnum.WAITING,
    },
    action: { type: ScheduleActionEnum, required: true },
	repeatRule: String,
    endAt: { type: String, required: true },
    data: Object,
    metadata: Object,
    history: { type: Array, default: [] },
  },
  { timestamps: true }
);

schema.virtual("json").get(function () {
  const { originId, ...other } = dbUtils.normalizeRecord(this);

  return { ...other };
});

export default mongoose.model("schedule", schema);
