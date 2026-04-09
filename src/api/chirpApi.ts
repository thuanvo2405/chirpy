import { NextFunction, Request, Response } from "express";
import { chirps, NewChirp } from "../db/schema.js";
import {
  createChirp,
  deleteOne,
  getChirps,
  getOne,
} from "../db/queries/chirps.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../middleware/errors.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";

export async function createNewChirp(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { body }: { body: string } = req.body;

    const token = getBearerToken(req);

    const userId = validateJWT(token);

    if (!body) {
      res.status(400).json({ error: "Please provide your content post" });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: "Please provide your userId" });
      return;
    }

    if (body.length > 140) {
      res.status(400).json({
        error: "Chirp is too long. Max length is 140",
      });
      return;
    }

    const profaneWords = ["kerfuffle", "sharbert", "fornax"];

    const words = body.split(" ");

    const cleanWords = words.map((word) => {
      const lower = word.toLowerCase();
      if (profaneWords.includes(lower)) {
        return "****";
      }
      return word;
    });

    const cleaned = cleanWords.join(" ");

    const newChirp: NewChirp = {
      body: cleaned,
      userId,
    };

    const chirp = await createChirp(newChirp);

    if (!chirp) {
      throw new Error("Failed to create chirp");
    }

    res.status(201).json(chirp);
  } catch (err) {
    next(err);
  }
}

export async function getAllChirps(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { authorId, sort } = req.query as {
      authorId?: string;
      sort?: "asc" | "desc";
    };

    const chirps = await getChirps({
      authorId,
      sort,
    });

    return res.status(200).json(chirps);
  } catch (err) {
    next(err);
  }
}

export async function getChirp(
  req: Request<{ chirpId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { chirpId } = req.params;

    if (typeof chirpId !== "string") {
      throw new BadRequestError("Invalid chirp ID");
    }

    const chirp = await getOne(chirpId);

    if (!chirp) {
      res.status(404).json({ error: "Chirp not found" });
      return;
    }

    res.status(200).json(chirp);
  } catch (err) {
    next(err);
  }
}

export async function deleteChirp(
  req: Request<{ chirpId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { chirpId } = req.params;

    const token = getBearerToken(req);
    const userId = validateJWT(token);

    if (!chirpId) {
      throw new BadRequestError("Invalid chirp ID");
    }

    const result = await deleteOne(chirpId, userId);

    if (result.length === 0) {
      const existing = await db
        .select()
        .from(chirps)
        .where(eq(chirps.id, chirpId));

      if (existing.length === 0) {
        throw new NotFoundError("Chirp not found"); // 404
      }

      throw new ForbiddenError("You can't delete this chirp"); // 403
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
