import database from "./database";
import { normalize } from "./helpers";

export async function findSchedules(query) {
  return database
    .find(query)
    .then((res) => res.map(normalize))
    .catch((err) => {
      console.error(err);
      return null;
    });
}

export async function addSchedule(payload) {
  return database
    .create(payload)
    .then(normalize)
    .catch((err) => {
      console.error(err);
      return null;
    });
}

export async function updateSchedule(query, payload) {
  return database
    .findOneAndUpdate(query, payload, { new: true })
    .then(normalize)
    .catch((err) => {
      console.error(err);
      return null;
    });
}

export async function deleteSchedule(id) {
  return database.findByIdAndDelete(id).catch((err) => {
    console.error(err);
    return null;
  });
}
