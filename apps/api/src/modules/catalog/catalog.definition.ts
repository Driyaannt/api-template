export type ApiEndpointDefinition = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  name: string;
  description: string;
  module: string;
  requiresAuth: boolean;
  requestExample: Record<string, unknown> | null;
};

// Ubah metadata ini saat endpoint atau body request berubah. Dev server akan menyinkronkannya ke tabel api_endpoints saat reload.
export const apiEndpointDefinitions: ApiEndpointDefinition[] = [
  {
    method: "GET",
    path: "/health",
    name: "Health check",
    description: "System status",
    module: "System",
    requiresAuth: false,
    requestExample: null,
  },
  {
    method: "GET",
    path: "/ready",
    name: "Readiness check",
    description: "Service readiness",
    module: "System",
    requiresAuth: false,
    requestExample: null,
  },
  {
    method: "POST",
    path: "/auth/register",
    name: "Register",
    description: "Create a user account",
    module: "Authentication",
    requiresAuth: false,
    requestExample: {
      name: "Jane Doe",
      email: "jane@example.test",
      password: "<choose-a-strong-password>",
    },
  },
  {
    method: "POST",
    path: "/auth/login",
    name: "Login",
    description: "Obtain an access token",
    module: "Authentication",
    requiresAuth: false,
    requestExample: {
      email: "admin@example.test",
      password: "<your-password>",
    },
  },
  {
    method: "POST",
    path: "/auth/refresh",
    name: "Refresh token",
    description: "Refresh access token",
    module: "Authentication",
    requiresAuth: false,
    requestExample: null,
  },
  {
    method: "POST",
    path: "/auth/logout",
    name: "Logout",
    description: "Revoke refresh token",
    module: "Authentication",
    requiresAuth: false,
    requestExample: null,
  },
  {
    method: "GET",
    path: "/auth/me",
    name: "Current profile",
    description: "Read authenticated user",
    module: "Authentication",
    requiresAuth: true,
    requestExample: null,
  },
  {
    method: "GET",
    path: "/products",
    name: "List products",
    description: "Pagination, search, filter, sorting",
    module: "Products",
    requiresAuth: false,
    requestExample: null,
  },
  {
    method: "POST",
    path: "/products",
    name: "Create product",
    description: "Create a product. Draft body is saved to your account.",
    module: "Products",
    requiresAuth: true,
    requestExample: {
      name: "Mechanical Keyboard",
      sku: "KB-001",
      description: "Hot-swappable keyboard",
      price: 899000,
      stock: 10,
      status: "ACTIVE",
    },
  },
  {
    method: "GET",
    path: "/products/{id}",
    name: "Product detail",
    description: "Read product by UUID",
    module: "Products",
    requiresAuth: false,
    requestExample: null,
  },

  // testtt
  {
    method: "POST",
    path: "/products-list",
    name: "buat product",
    description: "Create a product. Draft body is saved to your account.",
    module: "Products",
    requiresAuth: true,
    requestExample: {
      name: "papan dada",
      sku: "1231231",
      description: "papanpapan",
      price: 899000,
      stock: 10,
      status: "ACTIVE",
    },
  },
];
