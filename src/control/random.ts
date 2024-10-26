import { v4 as uuidv4 } from "uuid";

export function getRandomNumber(min = 0, max = 1, floor = true) {
  const value = Math.random() * max - min + min;

  return floor ? Math.floor(value) : value;
}

const chars = [...`abcdefghijklmnopqrstuvwxyz0123456789`];

export function getRandomId(length: number = 36): string {
  if (length === 36) {
    return uuidv4();
  }

  const numberOfChars = chars.length;

  return Array.from({ length })
    .map(() => chars[Math.floor(Math.random() * numberOfChars)])
    .join("");
}
