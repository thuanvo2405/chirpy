import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteAllUsers() {
  await db.delete(users);
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));

  return user;
}

export async function updateUserById(
  userId: string,
  data: { email: string; hashedPassword: string },
) {
  const [result] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning();

  return result;
}

export async function upgradeUserToRed(userId: string) {
  const [user] = await db
    .update(users)
    .set({ isChirpyRed: true })
    .where(eq(users.id, userId))
    .returning();

  return user;
}
