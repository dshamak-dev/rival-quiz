import { USER_HISTORY_TYPE } from "./constants";
import { UserDTO } from "./model";
import { findUserByQuery } from "./user.action";
import { UserHistoryDB } from "./user.schema";
import { parseToken } from "./user.utils";
import { getSessionById } from "../session/session.action";

export async function findUserByToken(token: string): Promise<UserDTO | null> {
  if (!token) {
    return Promise.reject("No token provided");
  }

  const decoded = parseToken(token);

  if (!decoded) {
    return Promise.reject("Invalid token");
  }

  let query = {};

  switch (decoded?.authType) {
    case "telegram": {
      if (!decoded.id) {
        return Promise.reject("Invalid Telegram user ID");
      }

      query = {
        "meta.id": decoded.id,
      };
      break;
    }
    case "email":
    default: {
      if (!decoded.email || !decoded.password) {
        return Promise.reject("Invalid Token");
      }

      query = { email: decoded.email, password: decoded.password };
    }
  }

  return findUserByQuery(query).catch((err) => null);
}

export async function addUserHistory(
  userId: string,
  type: USER_HISTORY_TYPE,
  metadata: any
) {
  const userHistory = new UserHistoryDB({
    userId,
    type,
    metadata,
  });

  return userHistory
    .save()
    .then((res: any) => res?.json)
    .catch((err) => null);
}

export async function removeUserHistory(
  userId: string,
  type: USER_HISTORY_TYPE,
  data: any
) {
  let query: Record<string, any> | null = null;

  switch (type) {
    case USER_HISTORY_TYPE.JOIN_SESSION: {
      query = { userId, type, "metadata.sessionId": data?.sessionId };
      break;
    }
  }

  if (query == null) {
    return Promise.reject("Invalid query for user history removal");
  }

  return UserHistoryDB.findOneAndDelete(query)
    .exec()
    .then((res: any) => res?.json)
    .catch((err) => null);
}

export async function getUserHistory(userId: string, query = {}) {
  return UserHistoryDB.find({ userId, ...query })
    .sort({ created: -1 })
    .then((res) => res.map((it: any) => it.json))
    .then(async (items) => {
      // Note: Populate item with session data

      let data: any[] = [];

      for (const item of items) {
        if (!item) {
          continue;
        }

        const sessionId = item.metadata?.sessionId;

        if (sessionId) {
          const session = await getSessionById(sessionId).catch((err) => null);

          if (!session) {
            data.push(item);
            continue;
          }

          data.push({
            ...item,
            data: { title: session.title, state: session.state },
          });
        } else {
          data.push(item);
        }
      }

      return data;
    })
    .catch((err) => null);
}
