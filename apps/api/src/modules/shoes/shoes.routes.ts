import { Router } from "express";
import { z } from "zod";
import { query } from "../../database/raw/pool.js";
import { AppError } from "../../errors/app-error.js";
import { authenticate } from "../../middlewares/authenticate.js";
const router = Router();
const create = z.object({
  code: z.string().trim().min(2).max(50),
  name: z.string().trim().min(2).max(160),
  brand: z.string().trim().min(2).max(100),
  category: z.string().trim().min(2).max(50),
  gender: z.enum(["MEN", "WOMEN", "UNISEX", "KIDS"]).default("UNISEX"),
  color: z.string().trim().max(60).optional(),
  sizeEu: z.coerce.number().min(15).max(55),
  price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative().default(0),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});
router.get("/", async (_req, res, next) => {
  try {
    const r = await query(
      'SELECT id,code,name,brand,category,gender,color,size_eu AS "sizeEu",price,stock,status,created_at AS "createdAt" FROM shoe_masters WHERE deleted_at IS NULL ORDER BY created_at DESC',
    );
    res.json({
      success: true,
      message: "Shoes retrieved successfully",
      data: r.rows,
    });
  } catch (error) {
    next(error);
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    const r = await query(
      'SELECT id,code,name,brand,category,gender,color,size_eu AS "sizeEu",price,stock,status FROM shoe_masters WHERE id=$1 AND deleted_at IS NULL',
      [z.string().uuid().parse(req.params.id)],
    );
    if (!r.rows[0]) throw new AppError(404, "SHOE_NOT_FOUND", "Shoe not found");
    res.json({
      success: true,
      message: "Shoe retrieved successfully",
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
      `INSERT INTO shoe_masters(code,name,brand,category,gender,color,size_eu,price,stock,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,code,name,brand,category,gender,color,size_eu AS "sizeEu",price,stock,status`,
      [
        d.code.toUpperCase(),
        d.name,
        d.brand,
        d.category,
        d.gender,
        d.color ?? null,
        d.sizeEu,
        d.price,
        d.stock,
        d.status,
      ],
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Shoe created successfully",
        data: r.rows[0],
      });
  } catch (error) {
    next(error);
  }
});
export { router as shoesRouter };
