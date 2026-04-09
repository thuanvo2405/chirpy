import { db } from "../index.js";
import { RefreshToken, refreshTokens } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createRefreshToken(refreshToken: RefreshToken) {
  const [result] = await db
    .insert(refreshTokens)
    .values(refreshToken)
    .onConflictDoNothing()
    .returning();

  return result;
}

export async function getRefreshToken(token: string) {
  const result = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));

  return result;
}
export async function revokeRefreshToken(token: string) {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, token));
}
