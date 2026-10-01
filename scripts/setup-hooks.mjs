import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

// Docker runs npm ci with no .git and no dev dependencies; never break the install.
if (!existsSync(".git") || !existsSync(".githooks")) process.exit(0);

try {
    execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "ignore" });
} catch {
    process.exit(0);
}
