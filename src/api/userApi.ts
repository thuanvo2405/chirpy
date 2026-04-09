import { NextFunction, Request, Response } from "express";
import {
  createUser,
  deleteAllUsers,
  updateUserById,
  upgradeUserToRed,
} from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { config } from "../config.js";
import {
  getAPIKey,
  getBearerToken,
  hashPassword,
  validateJWT,
} from "../auth.js";
import { UnauthorizedError } from "../middleware/errors.js";

export async function createNewUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password }: { email: string; password: string } = req.body;
    if (!email) {
      res.status(400).json({ error: "Please provide your email" });
      return;
    }

    if (!password) {
      res.status(400).json({ error: "Please provide your password" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const newUser: NewUser = {
      email,
      hashedPassword,
    };

    const user = await createUser(newUser);

    const { hashedPassword: _, ...userWithoutPass } = user;

    res.status(201).json(userWithoutPass);
  } catch (err) {
    next(err);
  }
}

export async function reset(req: Request, res: Response, next: NextFunction) {
  try {
    if (config.api.platform !== "dev") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    config.api.fileserverHits = 0;

    await deleteAllUsers();
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).json({ message: "All users deleted" });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Please provide your email" });
    }

    if (!password) {
      return res.status(400).json({ error: "Please provide your password" });
    }

    const token = getBearerToken(req);
    const userId = validateJWT(token);

    const hashedPassword = await hashPassword(password);

    const user = await updateUserById(userId, {
      email,
      hashedPassword,
    });

    const { hashedPassword: _, ...userWithoutPass } = user;

    res.status(200).json(userWithoutPass);
  } catch (err) {
    next(err);
  }
}

export async function polkaWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { event, data } = req.body;
    const key = getAPIKey(req);

    if (event !== "user.upgraded") {
      return res.status(204).send();
    }

    console.log(key);
    console.log(process.env.POLKA_KEY);

    if (key !== process.env.POLKA_KEY) {
      throw new UnauthorizedError("Your key");
    }

    const userId = data?.userId;

    const user = await upgradeUserToRed(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
