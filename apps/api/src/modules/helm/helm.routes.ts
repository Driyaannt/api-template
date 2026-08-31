import { Router } from "express";
import { z } from "zod";
import { query } from "../../database/raw/pool.js";
import { AppError } from "../../errors/app-error.js";
import { authenticate } from "../../middlewares/authenticate.js";
const router = Router();
const create = z.object({
  code: z.string().trim().min(2).max(50),
  nama: z.string().trim().min(2).max(160),
  title: z.string().trim().min(2).max(160).optional(),
});
router.get("/", async (_req, res, next) => {
  try {
    const r = await query(
      'SELECT id,code,nama,title FROM helm WHERE deleted_at IS NULL ORDER BY created_at DESC',
    );
    res.json({
      success: true,
      message: "Helms retrieved successfully",
      data: r.rows,
    });
  } catch (error) {
    next(error);
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    const r = await query(
      'SELECT id,code,nama,title FROM helm WHERE id=$1 AND deleted_at IS NULL',
      [z.string().uuid().parse(req.params.id)],
    );
    if (!r.rows[0]) throw new AppError(404, "HELM_NOT_FOUND", "Helm not found");
    res.json({
      success: true,
      message: "Helm retrieved successfully",
      data: r.rows[0],
    });
  } catch (error) {
    next(error);
  }
});
router.post("/", authenticate, async (req, res, next) => {
  try {
    const d = create.parse(req.body);
    const r = await query(
      `INSERT INTO helm(code,nama,title) VALUES($1,$2,$3) RETURNING id,code,nama,title`,
      [d.code.toUpperCase(), d.nama, d.title ?? null],
    );
    res.status(201).json({
      success: true,
      message: "Helm created successfully",
      data: r.rows[0],
    });
  } catch (error) {
    next(error);
  }
});
export { router as helmRouter };
