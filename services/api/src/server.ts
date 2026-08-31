import { createDbConnection } from "@stemweave/db";

import { buildApi } from "./app.js";
import { DevelopmentAuthAdapter } from "./auth/development-auth.js";
import { PostgresProjectRepository } from "./modules/projects/postgres-project-repository.js";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/stemweave";
const port = Number(process.env.PORT ?? "3000");
const host = process.env.HOST ?? "127.0.0.1";

const connection = createDbConnection(databaseUrl);
const app = await buildApi({
  auth: new DevelopmentAuthAdapter(),
  repository: new PostgresProjectRepository(connection.db),
});

app.addHook("onClose", async () => connection.close());

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exitCode = 1;
}
