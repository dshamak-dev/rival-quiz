import mongoose from "mongoose";
import { normalize } from "./utils";
import { QuestionDataStatusTypes } from "./model";

const schema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  questionId: { type: String, required: true },
  state: {
    type: Number,
    enum: Object.values(QuestionDataStatusTypes),
    default: QuestionDataStatusTypes.Draft,
    requeired: true,
  },
  votes: Array,
  totalVotes: Number,
  totalByVotes: Object,
  answer: String,
}, { timestamps: true });

schema.virtual("json").get(function () {
  const { _id, ...other } = this.toObject();

  return { ...other, id: _id };
});

const model = mongoose.model("question-data", schema);

export function create(payload) {
  return model.create(payload).then((res) => normalize(res));
}

export function findByIdAndUpdate(id, payload) {
  return model
    .findByIdAndUpdate(id, payload, { new: true })
    .then((res) => normalize(res));
}

export function deleteById(id) {
  return model.findByIdAndDelete(id);
}

export function findOne(query) {
  return model.findOne(query).then(normalize);
}

export function findMany(query) {
  return model.find(query).then((res) => res.map(normalize));
}
