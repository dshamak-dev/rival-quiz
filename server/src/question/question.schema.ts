import mongoose from "mongoose";

export const QuestionSchema = new mongoose.Schema(
  {
    _id: false,
    id: {
      type: String,
      default: function () {
        return new mongoose.Types.ObjectId().toHexString();
      },
    },
    title: String,
    description: String,
    type: { type: String, enum: ["single", "multiple", "custom"] },
    options: { type: [String], default: [] },
    hasAnswer: { type: Boolean, default: false },
    answer: { type: String },
  } as any,
  { timestamps: true }
);

QuestionSchema.virtual("json").get(function () {
  const { _id, ...other } = this.toObject();

  return { ...other };
});
