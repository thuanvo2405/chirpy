import { loadEnvFile } from "node:process";
import type { MigrationConfig } from "drizzle-orm/migrator";

loadEnvFile();

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env: ${key}`);
  }
  return value;
}

export type APIConfig = {
  fileserverHits: number;
  platform: string;
  jwtSecret: string;
};

export type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

export type AppConfig = {
  api: APIConfig;
  db: DBConfig;
};

export const config: AppConfig = {
  api: {
    fileserverHits: 0,
    platform: envOrThrow("PLATFORM"),
    jwtSecret: envOrThrow("JWT_SECRET"),
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: {
      migrationsFolder: "./src/db/migrations",
    },
  },
};
