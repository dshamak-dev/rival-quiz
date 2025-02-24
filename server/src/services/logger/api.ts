import database from "./database";
import { normalize } from "./helpers";
import { LogCreate } from "./types";

export async function findLogs(query) {
  return database
    .find(query)
    .then((res) => res.map(normalize))
    .catch((err) => {
      console.error(err);
      return null;
    });
}

export async function addLog(payload: LogCreate) {
  return database
    .create(payload)
    .then(normalize)
    .catch((err) => {
      console.error(err);
      return null;
    });
}
