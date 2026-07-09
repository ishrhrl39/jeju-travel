import { cpSync, existsSync, rmSync } from "node:fs";

const source = "out";
const target = "public";

if (!existsSync(source)) {
  throw new Error(`Build output directory "${source}" was not found.`);
}

if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true });
}

cpSync(source, target, { recursive: true });
