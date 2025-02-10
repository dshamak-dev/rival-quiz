import mongoose from "mongoose";
import { normalizeRecord } from "../database/database.utils";

export const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  originPass: String,
  name: String,
  authType: { type: String, enum: ["email", "telegram"], default: "email" },
  photoUrl: String,
  meta: Object,
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

UserSchema.virtual("json").get(function () {
  const { id, originPass, originId, _id, ...other } = normalizeRecord(this);

  return { ...other, id: id || _id };
});
