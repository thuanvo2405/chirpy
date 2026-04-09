import { NextFunction, Request, Response } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import {
  checkPasswordHash,
  getBearerToken,
  makeJWT,
  makeRefreshToken,
} from "../auth.js";
import {
  createRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
} from "../db/queries/refreshToken.js";
import { RefreshToken } from "../db/schema.js";
import { UnauthorizedError } from "../middleware/errors.js";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Missing email or password" });
      return;
    }

    const user = await getUserByEmail(email);

    if (!user) {
      res.status(401).json({ error: "incorrect email or password" });
      return;
    }

    const isValid = await checkPasswordHash(password, user.hashedPassword);

    if (!isValid) {
      res.status(401).json({ error: "incorrect email or password" });
      return;
    }

    const token = makeJWT(user.id);
    const refreshToken = makeRefreshToken();

    const refreshTokenData: RefreshToken = {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      revokedAt: null,
    };

    await createRefreshToken(refreshTokenData);

    res.status(200).json({
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      isChirpyRed: user.isChirpyRed,
      token: token,
      refreshToken: refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshAccessToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = getBearerToken(req);

    const result = await getRefreshToken(token);

    if (result.length === 0) {
      throw new UnauthorizedError("Invalid token");
    }

    const refreshToken = result[0];

    if (
      refreshToken.expiresAt.getTime() < Date.now() ||
      refreshToken.revokedAt !== null
    ) {
      throw new UnauthorizedError("Invalid token");
    }

    const newAccessToken = makeJWT(refreshToken.userId);

    res.status(200).json({
      token: newAccessToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function revokeToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = getBearerToken(req);

    const result = await revokeRefreshToken(token);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
