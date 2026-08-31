import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";

export * from "./schema.js";
export { schema };

export function createDbConnection(connectionString: string) {
  const client = postgres(connectionString, { max: 10 });
  const db = drizzle(client, { schema });

  return {
    client,
    close: async () => client.end(),
    db,
  };
}

export type Database = ReturnType<typeof createDbConnection>["db"];
