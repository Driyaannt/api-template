export type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT";
export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  stock: number;
  status: ProductStatus;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface ProductListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: ProductStatus;
  sortBy: "name" | "sku" | "price" | "stock" | "createdAt";
  sortOrder: "asc" | "desc";
}
export interface PaginatedProducts {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface ProductRepository {
  findAll(query: ProductListQuery): Promise<PaginatedProducts>;
  findById(id: string): Promise<Product | null>;
  create(input: { name:string; sku:string; description?:string; price:number; stock:number; status:ProductStatus; createdBy:string }): Promise<Product>;
}
