import { and, eq, asc, desc } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();

  return result;
}

export async function getChirps(options?: {
  authorId?: string;
  sort?: "asc" | "desc";
}) {
  const order =
    options?.sort === "asc" ? asc(chirps.createdAt) : desc(chirps.createdAt);

  const result = await db
    .select()
    .from(chirps)
    .where(options?.authorId ? eq(chirps.userId, options.authorId) : undefined)
    .orderBy(order);

  return result;
}
export async function getOne(chirpId: string) {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
  if ([result].length === 0) {
    return;
  }
  return result;
}

export async function deleteOne(chirpId: string, userId: string) {
  const result = await db
    .delete(chirps)
    .where(and(eq(chirps.id, chirpId), eq(chirps.userId, userId)))
    .returning();

  return result;
}
