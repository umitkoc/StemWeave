import { rmSync } from "node:fs";
import { resolve } from "node:path";

const packageRoot = resolve(process.cwd(), process.argv[2] ?? ".");

for (const directory of ["coverage", "dist"]) {
  rmSync(resolve(packageRoot, directory), { force: true, recursive: true });
}
