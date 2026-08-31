import { Router } from "express";
import { query } from "../../database/raw/pool.js";

const router = Router();
router.get("/", async (_req, res, next) => {
  try {
    const result = await query<{
      id: string;
      method: string;
      path: string;
      name: string;
      description: string | null;
      module: string;
      requires_auth: boolean;
      request_example: unknown;
    }>(
      "SELECT id,method,path,name,description,module,requires_auth,request_example FROM api_endpoints ORDER BY module,name",
    );
    res.json({
      success: true,
      message: "API catalog retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});
export { router as catalogRouter };
