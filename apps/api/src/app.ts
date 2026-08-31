import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { authRouter } from "./modules/auth/auth.routes.js";
import { AppError } from "./errors/app-error.js";
import { env } from "./config/env.js";
import { productsRouter } from "./modules/products/products.routes.js";
import { catalogRouter } from "./modules/catalog/catalog.routes.js";
import { historyRouter } from "./modules/catalog/history.routes.js";
import { shoesRouter } from "./modules/shoes/shoes.routes.js";
type DatabaseError = Error & { code?: string; constraint?: string; column?: string };
function mapDatabaseError(error: DatabaseError): AppError | null {
  switch (error.code) {
    case "23505": return new AppError(409, "DUPLICATE_RECORD", "A record with this unique value already exists", error.constraint ? [{ field: error.constraint, message: "Value must be unique" }] : undefined);
    case "23503": return new AppError(409, "FOREIGN_KEY_CONSTRAINT", "This record is still referenced by another record");
    case "23502": return new AppError(400, "REQUIRED_FIELD", "A required database field is missing", error.column ? [{ field: error.column, message: "Required" }] : undefined);
    case "22P02": return new AppError(400, "INVALID_DATABASE_VALUE", "One or more values have an invalid format");
    case "42P01": return new AppError(503, "DATABASE_SCHEMA_OUTDATED", "Required database table is missing. Run db:migrate.");
    default: return null;
  }
}
import { helmRouter } from "./modules/helm/helm.routes.js";
export const app = express();
app.use((req, _res, next) => {
  req.requestId = randomUUID();
  next();
});
app.use(helmet());
app.use(cors({ origin: env.NODE_ENV === "production" ? env.CORS_ORIGIN : /^http:\/\/localhost:\d+$/, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.get("/api/v1/health", (_req, res) =>
  res.json({ success: true, message: "Healthy", data: { status: "ok" } }),
);
app.get("/api/v1/ready", (_req, res) =>
  res.json({ success: true, message: "Ready", data: { status: "ready" } }),
);
app.get("/api/v1/openapi.json", (_req, res) =>
  res.json({
    openapi: "3.0.3",
    info: { title: "backend-driya API", version: "0.1.0" },
    paths: {
      "/api/v1/auth/login": {
        post: { tags: ["Authentication"], summary: "Login" },
      },
      "/api/v1/products": {
        get: { tags: ["Products"], summary: "List products" },
      },
      "/api/v1/products/{id}": {
        get: { tags: ["Products"], summary: "Get product by ID" },
      },
    },
  }),
);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/api-catalog", catalogRouter);
app.use("/api/v1/api-history", historyRouter);
app.use("/api/v1/master/shoes", shoesRouter);
app.use("/api/v1/master/helm", helmRouter);
app.use((_req, _res, next) =>
  next(new AppError(404, "NOT_FOUND", "Route not found")),
);
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const databaseError = err instanceof Error ? mapDatabaseError(err as DatabaseError) : null;
    const e =
      err instanceof AppError
        ? err
        : err instanceof Error && err.name === "ZodError"
          ? new AppError(
              400,
              "VALIDATION_ERROR",
              "Validation failed",
              (
                err as unknown as {
                  issues: { path: (string | number)[]; message: string }[];
                }
              ).issues.map((i) => ({
                field: i.path.join("."),
                message: i.message,
              })),
            )
          : databaseError ?? new AppError(500, "INTERNAL_ERROR", "An unexpected error occurred");
    res
      .status(e.status)
      .json({
        success: false,
        message: e.message,
        code: e.code,
        errors: e.details,
        requestId: req.requestId,
      });
  },
);
