import { UserDTO } from "./model";
import { findUserByQuery } from "./user.action";
import { parseToken } from "./user.utils";

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
