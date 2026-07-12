type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
  all<T = unknown>(): Promise<{ results?: T[] }>;
};

type D1Database = {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
};

type Fetcher = {
  fetch(request: Request): Promise<Response>;
};

declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
    ASSETS?: Fetcher;
    IMAGES?: unknown;
  };
}
