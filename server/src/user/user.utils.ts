import jwt from "jsonwebtoken";
import crypto from "crypto";

const secret: string = process.env.JWT_SECRET || "secret_key";
const salt: string = process.env.SECRET_SALT || "salt_key";

export function generateToken(user) {
  // Implementation for generating a token
  return jwt.sign(
    { email: user.email, password: user.password },
    secret
  );
}

export function parseToken(token): { email: string, password: string } | null {
	const parsed = jwt.verify(token, secret);

  if (parsed) {
    return parsed as { email: string, password: string };
  }

  return null;
}

export function encryptPassword(value) {
  return crypto
    .pbkdf2Sync(value, salt, 1000, 64, "sha512")
    .toString();
}

export function getAuthToken(request) {
	// const cookies = request.cookies || request.headers.cookie;

	const token = request.headers.authorization?.split(' ')[1];

	// if (!token) {
	// 	token = request.headers.authorization?.split(' ')[1];
	// }

	return token;
}