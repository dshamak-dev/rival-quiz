import mongoose from "mongoose";
import * as dbUtils from "../database/database.utils";

export const UserActionSchema = new mongoose.Schema(
  {
    sessionId: String,
    questionId: String,
    userId: { type: String, required: true },
    type: { type: Number, required: true },
    data: Object,
  },
  { timestamps: true }
);

UserActionSchema.virtual("json").get(function () {
  const json = dbUtils.normalizeRecord(this);

  return json;
});
