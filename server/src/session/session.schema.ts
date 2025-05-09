import mongoose from "mongoose";
import { SessionStateType } from "./session.model";
import { QuestionSchema } from "../question/question.schema";
import { randomString } from "../tools/random.utils";
import { SessionTypes } from "@shared/session/type";

export const SessionSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    hash: {
      type: String,
      unique: true,
      default: function () {
        const length = 8;
        const reg = new RegExp(`(\\S{${length / 2}})`, "g");
        return randomString(length).replace(reg, "$1-").slice(0, -1);
      },
    },
    ownerId: { type: String, required: true },
    metadata: Object,
    state: { type: Number, default: SessionStateType.Draft },
    questions: { type: [QuestionSchema], default: [] },
    hasNextQuestion: { type: Boolean, default: true },
    activeQuestionId: { type: String },
    settings: Object,
    type: {
      type: String,
      enum: SessionTypes,
    },
    image: String,
    users: { type: [String], default: [] },
    usersInfo: { type: Object, default: {} },
  },
  { timestamps: true }
);

SessionSchema.virtual("json").get(function () {
  const { _id, ...other } = this.toObject();

  return { ...other, id: _id };
});

// export const SessionParticipantSchema = new mongoose.Schema(
//   {
//     sessionID: String,
//     userID: String,
//     score: Number,
//     answers: { type: [String] },
//     transaction: String,
//   },
//   { timestamps: true }
// );
