import { sessionDataDBModel } from "./session-data.actions";
import { normalizeSessionData } from "./session-data.utils";

export async function findManySessionData(query) {
  return sessionDataDBModel.find(query).then((res) => res.map(normalizeSessionData));
}

export async function findSessionData(query) {
	return sessionDataDBModel.findOne(query).then(normalizeSessionData);
  }

export async function findActiveSessionDataBySessionId(sessionId) {
  return sessionDataDBModel
    .findOne({ sessionId, state: 0 })
    .then(normalizeSessionData);
}
