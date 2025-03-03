import mongoose from "mongoose";
import { normalize } from "./utils";
import * as dbUtils from "../../database/database.utils";
import { TransactionStatusEnum } from "./model";

const schema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderType: { type: String },
  receiverId: { type: String, required: true },
  receiverType: { type: String },
  type: { type: String, required: true },
  amount: Number,
  data: Object,
  status: {
    type: Number,
    enum: Object.values(TransactionStatusEnum),
    default: TransactionStatusEnum.Pending,
  },
  reference: String,
  details: String,
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

schema.virtual("json").get(function () {
  const { _id, ...other } = this.toObject();

  return { ...other, id: _id.toString() };
});

export const model = mongoose.model("transaction", schema);

export const create = (payload) => dbUtils.createOne(model, payload, normalize);

export const findMany = (query, props) =>
  dbUtils.findMany(model, query, normalize);

export const findOne = (query) => dbUtils.findOne(model, query, normalize);

export const findById = (id) => dbUtils.findOne(model, { _id: id }, normalize);

export const findByIdAndUpdate = (id, payload) =>
  dbUtils.findByIdAndUpdate(model, id, payload, normalize);
