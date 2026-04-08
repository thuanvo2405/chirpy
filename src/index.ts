import express, { NextFunction, Request, Response } from "express";
import { middlewareLogResponses } from "./middleware/middlewareLog.js";
import { handlerReadiness } from "./api/readLine.js";
import { middlewareMetricsInc } from "./middleware/middlewareMetricsInc.js";
import { config } from "./config.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "./middleware/errors.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const migrationClient = postgres(config.db.url, { max: 1 });

await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);

app.get("/admin/metrics", (req: Request, res: Response) => {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.api.fileserverHits} times!</p> 
  </body>
</html>`);
});

app.post("/admin/reset", (req: Request, res: Response) => {
  config.api.fileserverHits = 0;
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
});

app.post(
  "/api/validate_chirp",
  (req: Request, res: Response, next: NextFunction) => {
    type parameters = {
      body: string;
    };

    const params: parameters = req.body;

    const profaneWords = ["kerfuffle", "sharbert", "fornax"];

    try {
      if (params.body.length > 140) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
      }

      const words = params.body.split(" ");

      const cleanWords = words.map((word) => {
        const lower = word.toLowerCase();
        if (profaneWords.includes(lower)) {
          return "****";
        }
        return word;
      });

      const cleaned = cleanWords.join(" ");

      return res.status(200).json({
        cleanedBody: cleaned,
      });
    } catch (err) {
      next(err);
    }
  },
);

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof BadRequestError) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({ error: err.message });
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json({ error: err.message });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }

  return res.status(500).json({
    error: "Something went wrong on our end",
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
