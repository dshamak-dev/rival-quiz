import mongoose from "mongoose";
import { UserSchema } from "./user.schema";
import {
  encryptPassword,
  generateToken,
  getAuthToken,
  parseToken,
} from "./user.utils";

export const userDBModel = mongoose.model("users", UserSchema);

export async function findUserById(id) {
  return userDBModel.findOne({ _id: id });
}

export async function createUserWithPassword(email, password) {
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

export function updateUser(id, updates) {
  // Implementation for updating a user
  return userDBModel.findByIdAndUpdate(id, updates, { new: true });
}

export function deleteUser(id) {
  // Implementation for deleting a user
  return userDBModel.findByIdAndDelete(id);
}

export function getAllUsers() {
  // Implementation for getting all users
  return userDBModel.find();
}

export function findUserByQuery(query) {
  // Implementation for getting a user by email
  return userDBModel.findOne(query);
}

export async function getRequestUser(request) {
  const token = getAuthToken(request);

  if (!token) {
    return null;
  }

  const decoded = parseToken(token);

  if (!decoded) {
    return null;
  }

  const user = await findUserByQuery({
    email: decoded.email,
    password: decoded.password,
  }).catch((err) => null);

  return (user as any).json;
}

export function authorizeUser(user: any, response: any) {
  const token = generateToken(user);

  response.cookie("authToken", token, {
    httpOnly: false,
  });

  // response.cookie("token", token, {
  //   httpOnly: false,
  //   // path: "/",
  //   // sameSite = only send cookie if the request is coming from the same origin
  //   // sameSite: "lax", // "strict" | "lax" | "none" (secure must be true)
  //   maxAge: 3600000 * 6, // 6 hours
  // });
}
