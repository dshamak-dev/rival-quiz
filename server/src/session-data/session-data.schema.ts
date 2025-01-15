import mongoose from "mongoose";

export const SessionDataSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    totalUsers: { type: Number, required: true },
    votesByQuestion: { type: Object, required: true },
    userScores: { type: Object },
    // 0: active, 1: closed, 2: completed, 3: archived, 4: cancelled, 5: deleted
    state: { type: Number, required: true, default: 0 },
    activeQuestionId: String,
  },
  { timestamps: true }
);

SessionDataSchema.virtual("json").get(function () {
  const { _id, ...other } = this.toObject();

  return { ...other, id: _id };
});
