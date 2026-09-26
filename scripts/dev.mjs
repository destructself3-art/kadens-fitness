// Starts `next dev` from the project root whatever the caller's working directory is
// (used by the editor preview; `npm run dev` works the same).
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const next = join(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [next, "dev", "--port", process.env.PORT || "3200"], { cwd: root, stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
