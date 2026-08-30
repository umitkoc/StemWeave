import { rmSync } from "node:fs";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");

for (const directory of [".turbo", "coverage"]) {
  rmSync(resolve(repositoryRoot, directory), { force: true, recursive: true });
}
