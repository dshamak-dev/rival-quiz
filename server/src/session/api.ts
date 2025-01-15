import { sessionDBModel } from "./session.action";
import { normalizeSession } from "./session.utils";

export async function findManySessions(query = {}) {
  return sessionDBModel.find(query).then((res) => res.map(normalizeSession));
}
