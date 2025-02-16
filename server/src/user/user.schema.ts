import mongoose from "mongoose";
import { normalizeRecord } from "../database/database.utils";
import { randomString } from "../tools/random.utils";
import * as dbUtils from "../database/database.utils";

export const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  originPass: String,
  name: String,
  authType: { type: String, enum: ["email", "telegram"], default: "email" },
  photoUrl: String,
  meta: Object,
  tag: {
    type: String,
    unique: true,
  },
  role: {
    type: String,
    enum: ["SUPER_ADMIN", "ADMIN", "CREATOR", "USER"],
    default: "USER",
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

UserSchema.pre("validate", async function (next) {
  if (!this.tag) {
    this.tag = await generateUniqueTag();
  }

  next();
});

UserSchema.virtual("json").get(function () {
  const { id, originPass, originId, _id, ...other } = normalizeRecord(this);

  return { ...other, id: id || _id };
});

export const UserDBModel = mongoose.model("users", UserSchema);

async function generateUniqueTag() {
  let tag;
  let isUnique = false;

  while (!isUnique) {
    tag = randomString();
    const existingUser = await UserDBModel.findOne({ tag });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return tag;
}

export const UserHistorySchema = new mongoose.Schema(
  {
    userId: String,
    type: String,
    data: Object,
  },
  { timestamps: true }
);

UserHistorySchema.virtual("json").get(function () {
  const { originId, ...json } = dbUtils.normalizeRecord(this);

  return json;
});

export const UserHistoryDB = mongoose.model("user-history", UserHistorySchema);
