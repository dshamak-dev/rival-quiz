import { Log } from "./types";

export function normalize(dto): Log | null {
  return dto?.json;
}
