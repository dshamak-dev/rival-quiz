import mongoose from "mongoose";
import { normalizeRecord } from "../database/database.utils";

export const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  originPass: String,
  firstName: String,
  lastName: String,
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

UserSchema.virtual("json").get(function () {
  const { id, originPass, ...other } = normalizeRecord(this);

  return { ...other, id };
});
