import { UserDBModel } from "./user.schema";
import {
  encryptPassword,
  generateEmailToken,
  generateTelegramToken,
  getAuthToken,
} from "./user.utils";
import { TelegramMetaDTO, UserDTO } from "./model";
import { CookieOptions, Response } from "express";
import { findUserByToken } from "./api";

export async function findUserById(id) {
  return UserDBModel.findOne({ _id: id });
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

export async function createUserWithPassword({ email, password, ...other }) {
  if (!email || !password) {
    return Promise.reject("Invalid email or password");
  }

  const valid = await findUserByQuery({ email })
    .then((res) => {
      return res == null;
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
  return UserDBModel.create({
    ...other,
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

  return UserDBModel.create({
    name: metadata.name,
    authType: "telegram",
    photoUrl: metadata.photoUrl,
    meta: metadata,
  }).then(normalizeuser);
}

export function updateUser(id, updates) {
  // Implementation for updating a user
  return UserDBModel.findByIdAndUpdate(id, updates, { new: true }).then(
    normalizeuser
  );
}

export function deleteUser(id) {
  // Implementation for deleting a user
  return UserDBModel.findByIdAndDelete(id);
}

export function getAllUsers() {
  // Implementation for getting all users
  return UserDBModel.find().then((res) => res?.map(normalizeuser));
}

export function findUserByQuery(query) {
  // Implementation for getting a user by email
  return UserDBModel.findOne(query).then(normalizeuser);
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
const isProd = process.env.NODE_ENV === 'production';
const cookieConfig: CookieOptions = {
  httpOnly: true, // Prevents client-side access
  secure: isProd, // Use HTTPS in production
  sameSite: "lax", // Required for cross-origin cookies
  // domain: "localhost", // Ensure this matches your deployment
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const COOKIE_NAME = "authToken";
export function authorizeUser(user: UserDTO, response: Response) {
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

  response.cookie(COOKIE_NAME, token, cookieConfig);

  return token;
}
