import { query } from "../../database/raw/pool.js";
import type {
  PaginatedProducts,
  Product,
  ProductListQuery,
  ProductRepository,
} from "./products.repository.js";
type Row = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  stock: number;
  status: Product["status"];
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
  total_count: string;
};
const sortable: Record<ProductListQuery["sortBy"], string> = {
  name: "name",
  sku: "sku",
  price: "price",
  stock: "stock",
  createdAt: "created_at",
};
const map = (r: Row): Product => ({
  id: r.id,
  name: r.name,
  sku: r.sku,
  description: r.description,
  price: r.price,
  stock: r.stock,
  status: r.status,
  createdBy: r.created_by,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});
export class RawProductRepository implements ProductRepository {
  async findAll(input: ProductListQuery): Promise<PaginatedProducts> {
    const offset = (input.page - 1) * input.limit;
    const order = sortable[input.sortBy];
    const direction = input.sortOrder.toUpperCase();
    const term = input.search?.trim() ?? "";
    const result = await query<Row>(
      `SELECT id,name,sku,description,price,stock,status,created_by,created_at,updated_at,COUNT(*) OVER() AS total_count FROM products WHERE deleted_at IS NULL AND ($1='' OR name ILIKE $2 OR sku ILIKE $2) AND ($3::text='' OR status=$3) ORDER BY ${order} ${direction} LIMIT $4 OFFSET $5`,
      [term, `%${term}%`, input.status ?? "", input.limit, offset],
    );
    const total = Number(result.rows[0]?.total_count ?? 0);
    return {
      items: result.rows.map(map),
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
    };
  }
  async findById(id: string): Promise<Product | null> {
    const result = await query<Row>(
      `SELECT id,name,sku,description,price,stock,status,created_by,created_at,updated_at,0::text AS total_count FROM products WHERE id=$1 AND deleted_at IS NULL`,
      [id],
    );
    return result.rows[0] ? map(result.rows[0]) : null;
  }
  async create(input: { name:string; sku:string; description?:string; price:number; stock:number; status:Product['status']; createdBy:string }): Promise<Product> {
    const result = await query<Row>(`INSERT INTO products(name,sku,description,price,stock,status,created_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,name,sku,description,price,stock,status,created_by,created_at,updated_at,'0'::text AS total_count`,[input.name,input.sku,input.description??null,input.price,input.stock,input.status,input.createdBy]);
    return map(result.rows[0]);
  }
}
