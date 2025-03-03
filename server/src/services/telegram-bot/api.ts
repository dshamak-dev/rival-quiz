import mongoose from "mongoose";
import * as dbUtils from "../../database/database.utils";
import { TelegramBotDTO } from "./type";

const schema = new mongoose.Schema({
  name: String,
  token: String,
  webAppURL: String,
  enabled: Boolean,
  chats: { type: [String], default: [], unique: true },
});

schema.virtual("json").get(function () {
  const { _id, ...other } = this.toObject();

  return { ...other, id: _id.toString() };
});

export const model = mongoose.model("telegram", schema);

export const create = (payload) => dbUtils.createOne(model, payload, normalize);

export async function fetchTelegramBots() {
  return model.find({ enabled: true }).then((items) => items.map(normalize));
}

export const getChats = () =>
  model
    .findOne({})
    .then(normalize)
    .catch((err) => []);

export const addChat = async (
  chatId: string
): Promise<TelegramBotDTO["chats"]> => {
  const updated = await model
    .findOneAndUpdate({}, { $push: { chats: chatId } })
    .then(normalize)
    .catch((err) => null);

  return updated?.chats || [];
};

export const resetChatIds = (chatIds: string[]) =>
  model.findOneAndUpdate({}, { chats: chatIds }).then(normalize);

function normalize(dto): TelegramBotDTO {
  return {
    token: "",
    webAppURL: "",
    enabled: false,
    chats: [],
    ...dto?.json,
  };
}
