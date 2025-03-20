import mongoose from "mongoose";
import * as dbUtils from "../../database/database.utils";
import { InvoiceDTO, InvoiceStatus } from "./type";

const schema = new mongoose.Schema<InvoiceDTO>(
  {
    history: { type: Array, default: [] },
    metadata: Object,
    status: {
      type: String,
      enum: InvoiceStatus,
      required: true,
      default: InvoiceStatus.DRAFT,
    },
    userId: { type: String, required: true },
    items: { type: Array, default: [] },
    total: Number,
    discount: Number,
    currency: { type: String, required: true },
    cost: Number,
    validUntil: {
      type: Date,
      default: () => {
        const date = new Date();

        date.setHours(date.getHours() + 24);

        return date;
      },
    },
  },
  { timestamps: true }
);

schema.virtual("json").get(function () {
  const { originId, ...other } = dbUtils.normalizeRecord(this);

  return { ...other };
});

export default mongoose.model("invoice", schema);
