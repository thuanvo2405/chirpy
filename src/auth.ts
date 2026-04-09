import argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import { config } from "./config.js";
import { UnauthorizedError } from "./middleware/errors.js";
import crypto from "crypto";

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string): string {
  const iat = Math.floor(Date.now() / 1000);

  const payload: Payload = {
    iss: "chirpy",
    sub: userID,
    iat,
    exp: iat + 60 * 60,
  };

  const token = jwt.sign(payload, config.api.jwtSecret);

  return token;
}

export function validateJWT(tokenString: string): string {
  try {
    const decoded = jwt.verify(tokenString, config.api.jwtSecret);

    if (typeof decoded === "string") {
      throw new UnauthorizedError("invalid token");
    }

    if (typeof decoded.sub !== "string") {
      throw new UnauthorizedError("invalid token");
    }

    return decoded.sub;
  } catch {
    throw new UnauthorizedError("invalid token");
  }
}

export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password);
  } catch (err) {
    throw new Error("Failed to hash password");
  }
}

export async function checkPasswordHash(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    throw new Error("Failed to verify password");
  }
}

export function getBearerToken(req: Request): string {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Missing or invalid Authorization header");
  }

  return token;
}

export function makeRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getAPIKey(req: Request) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "ApiKey" || !token) {
    throw new UnauthorizedError("Missing or invalid Authorization header");
  }

  return token;
}
