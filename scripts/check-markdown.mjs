import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import process from "node:process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const ignoredDirectories = new Set([".git", ".turbo", "coverage", "dist", "node_modules"]);

function collectMarkdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return ignoredDirectories.has(entry.name) ? [] : collectMarkdownFiles(path);
    }

    return entry.isFile() && extname(entry.name) === ".md" ? [path] : [];
  });
}

const markdownFiles = collectMarkdownFiles(repositoryRoot);

const failures = [];
const markdownLinkPattern = /\]\(([^)#]+\.md)(?:#[^)]+)?\)/g;

for (const file of markdownFiles) {
  const content = readFileSync(file, "utf8");
  const fences = content.match(/^```/gm)?.length ?? 0;

  if (fences % 2 !== 0) {
    failures.push(`${file}: kapanmamış Markdown kod bloğu`);
  }

  for (const match of content.matchAll(markdownLinkPattern)) {
    const linkedPath = match[1];
    if (linkedPath === undefined) continue;

    const target = resolve(dirname(file), linkedPath);
    if (!existsSync(target)) {
      failures.push(`${file}: bulunamayan bağlantı ${linkedPath}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`${markdownFiles.length} Markdown dosyası doğrulandı.`);
}
