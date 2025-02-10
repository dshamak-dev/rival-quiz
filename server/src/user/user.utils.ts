import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserTokenDTO } from "./model";

const secret: string = process.env.JWT_SECRET || "secret_key";
const salt: string = process.env.SECRET_SALT || "salt_key";

export function generateToken(fields) {
  // Implementation for generating a token
  return jwt.sign(fields, secret, {
    expiresIn: "5d",
  });
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
    username: user.meta?.username,
    authType: "telegram",
  });
}

export function parseToken(token): UserTokenDTO | null {
  const parsed = jwt.verify(token, secret);

  if (parsed) {
    return parsed as UserTokenDTO;
  }

  return null;
}

export function encryptPassword(value) {
  return crypto.pbkdf2Sync(value, salt, 1000, 64, "sha512").toString();
}

export function getAuthToken(request) {
  const token = request.headers.authorization?.split(" ")[1];

  return token;
}
