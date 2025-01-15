import crypto from "crypto";

export function randomString(size = 8) {
  return crypto.randomBytes(size).toString("base64").slice(0, size);
}
