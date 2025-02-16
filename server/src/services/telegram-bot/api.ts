import mongoose from "mongoose";
import * as dbUtils from "../../database/database.utils";

const schema = new mongoose.Schema({
  chats: { type: [String], default: [] },
});

schema.virtual("json").get(function () {
  const { _id, ...other } = this.toObject();

  return { ...other, id: _id.toString() };
});

export const model = mongoose.model("telegram", schema);

export const create = (payload) => dbUtils.createOne(model, payload, normalize);

export const getChats = () => model.findOne({}).then(normalize);

export const addChat = (chatId: string): Promise<string[]> =>
  model.findOneAndUpdate({}, { $push: { chats: chatId } }).then(normalize);

export const resetChatIds = (chatIds: string[]) =>
  model.findOneAndUpdate({}, { chats: chatIds }).then(normalize);

function normalize(dto): string[] {
  return dto?.json?.chats;
}
