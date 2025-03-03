import { randomBytes } from "crypto";

export function randomString(size = 8) {
  return randomBytes(size).toString("base64url").slice(0, size);
}
