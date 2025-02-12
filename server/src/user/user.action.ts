import mongoose from "mongoose";
import { UserSchema } from "./user.schema";
import {
  encryptPassword,
  generateEmailToken,
  generateTelegramToken,
  generateToken,
  getAuthToken,
  parseToken,
} from "./user.utils";
import { TelegramMetaDTO, UserDTO } from "./model";
import { Response } from "express";
import { findUserByToken } from "./api";

export const userDBModel = mongoose.model("users", UserSchema);

export async function findUserById(id) {
  return userDBModel.findOne({ _id: id });
}

export function createUser(
  payload:
    | ({ authType: "telegram" } & TelegramMetaDTO)
    | { authType: "email"; email: string; password: string }
) {
  const { authType } = payload;

  switch (authType) {
    case "telegram": {
      return createUserWithTelegram(payload);
    }
    case "email":
    default: {
      return createUserWithPassword(payload);
    }
  }
}

export async function createUserWithPassword({ email, password }) {
  if (!!email || !password) {
    return Promise.reject("Invalid email or password");
  }

  const valid = await findUserByQuery({ email })
    .then((res) => {
      return res === null;
    })
    .catch((err) => {
      console.error(err);
      return false;
    });

  if (!valid) {
    throw new Error("Email already exists");
  }

  const passworkKey = encryptPassword(password);

  // Implementation for creating a user with password
  return userDBModel.create({
    email,
    password: passworkKey,
    originPass: password,
  });
}

export async function createUserWithTelegram(
  payload: { authType } & TelegramMetaDTO
) {
  if (!payload.id || !payload.name) {
    return Promise.reject("Invalid telegram data");
  }

  const user = await findUserByQuery({ "meta.id": payload.id });

  if (user != null) {
    return user;
  }

  const { authType, ...metadata } = payload;

  return userDBModel
    .create({
      name: metadata.name,
      authType: "telegram",
      photoUrl: metadata.photoUrl,
      meta: metadata,
    })
    .then(normalizeuser);
}

export function updateUser(id, updates) {
  // Implementation for updating a user
  return userDBModel
    .findByIdAndUpdate(id, updates, { new: true })
    .then(normalizeuser);
}

export function deleteUser(id) {
  // Implementation for deleting a user
  return userDBModel.findByIdAndDelete(id);
}

export function getAllUsers() {
  // Implementation for getting all users
  return userDBModel.find().then((res) => res?.map(normalizeuser));
}

export function findUserByQuery(query) {
  // Implementation for getting a user by email
  return userDBModel.findOne(query).then(normalizeuser);
}

export function normalizeuser(data) {
  return data?.json;
}

export async function getRequestUser(request) {
  const token = getAuthToken(request);

  if (!token) {
    return null;
  }

  return findUserByToken(token);
}

export function authorizeUser(user: UserDTO, response: any) {
  let token: string | null = null;

  switch (user.authType) {
    case "telegram": {
      token = generateTelegramToken(user);
      break;
    }
    case "email":
    default: {
      token = generateEmailToken(user);
    }
  }

  response.cookie("authToken", token, {
    httpOnly: false,
  });

  return token;

  // response.cookie("token", token, {
  //   httpOnly: false,
  //   // path: "/",
  //   // sameSite = only send cookie if the request is coming from the same origin
  //   // sameSite: "lax", // "strict" | "lax" | "none" (secure must be true)
  //   maxAge: 3600000 * 6, // 6 hours
  // });
}

// export function authorizeWithTelegram(user: UserDTO, response: Response) {
//   const token = generateTelegramToken(user);

//   response.cookie("authToken", token, {
//     httpOnly: false,
//   });

//   return token;
// }
