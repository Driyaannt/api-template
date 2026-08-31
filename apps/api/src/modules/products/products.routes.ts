import { Router } from "express";
import { z } from "zod";
import { AppError } from "../../errors/app-error.js";
import { RawProductRepository } from "./raw-product.repository.js";
import { authenticate } from "../../middlewares/authenticate.js";
const router = Router();
const repository = new RawProductRepository();
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).optional(),
  sortBy: z
    .enum(["name", "sku", "price", "stock", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
const createSchema = z.object({
  name: z.string().min(2).max(160),
  sku: z.string().min(2).max(80),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).default("ACTIVE"),
});
router.post("/", authenticate, async (req, res, next) => {
  try {
    const product = await repository.create({
      ...createSchema.parse(req.body),
      createdBy: req.user!.id,
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
  } catch (error) {
    next(error);
  }
});
router.get("/", async (req, res, next) => {
  try {
    const result = await repository.findAll(querySchema.parse(req.query));
    res.json({
      success: true,
      message: "Products retrieved successfully",
      data: result.items,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    const product = await repository.findById(
      z.string().uuid().parse(req.params.id),
    );
    if (!product)
      throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found");
    res.json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
});
export { router as productsRouter };
