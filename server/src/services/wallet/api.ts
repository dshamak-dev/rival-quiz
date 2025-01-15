import mongoose from "mongoose";
import * as dbUtils from "../../database/database.utils";
import { normalize } from "./utils";

export const schema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: {
    type: String,
    enum: ["draft", "demo", "unlim"],
    default: "draft",
  },
  currency: {
    type: String,
    enum: ["points", "crypto"],
    default: "points"
  },
  balance: { type: Number, default: 0 },
  data: Object,
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

schema.virtual("json").get(function () {
  const json = dbUtils.normalizeRecord(this);

  return json;
});

const model = mongoose.model("wallet", schema);

export const create = (payload) => dbUtils.createOne(model, payload, normalize);

export const findMany = (query) => dbUtils.findMany(model, query, normalize);

export const findById = (id) => dbUtils.findById(model, id, normalize);

export const findOne = (query) => dbUtils.findOne(model, query, normalize);

export const findByIdAndUpdate = (id, payload) => dbUtils.findByIdAndUpdate(model, id, payload, normalize);

export const findOneAndUpdate = (query, payload) => dbUtils.findAndUpdate(model, query, payload, normalize);

