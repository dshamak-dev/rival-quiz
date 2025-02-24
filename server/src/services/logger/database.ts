import mongoose from "mongoose";
import * as dbUtils from "../../database/database.utils";

const schema = new mongoose.Schema(
  {
    source: String,
	message: String,
	data: Object,
  },
  { timestamps: true }
);

schema.virtual("json").get(function () {
  const { originId, ...other } = dbUtils.normalizeRecord(this);

  return { ...other };
});

export default mongoose.model("log", schema);
