import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserTokenDTO } from "./model";
import { COOKIE_NAME } from "./user.action";

const secret: string = process.env.JWT_SECRET || "secret_key";
const salt: string = process.env.SECRET_SALT || "salt_key";

export function generateToken(fields) {
  const token = jwt.sign(fields, secret, {
    expiresIn: "5d",
  });

  return token;
}

export function generateEmailToken(user) {
  return generateToken({
    email: user.email,
    password: user.password,
    authType: "email",
  });
}

export function generateTelegramToken(user) {
  return generateToken({
    id: user.meta?.id,
    name: user.meta?.name,
    authType: "telegram",
    // secret,
  });
}

export function parseToken(token): UserTokenDTO | null {
  try {
    const parsed = jwt.verify(token, secret);

    if (parsed) {
      return parsed as UserTokenDTO;
    }

    return null;
  } catch (error) {
    return null;
  }
}

export function encryptPassword(value) {
  return crypto.pbkdf2Sync(value, salt, 1000, 64, "sha512").toString();
}

export function getAuthToken(request) {
  const cookie = request.cookies;

  const token = cookie?.[COOKIE_NAME];

  if (token) {
    const parsed = parseToken(token);

    return parsed ? token : null;
  }

  return null;
}
