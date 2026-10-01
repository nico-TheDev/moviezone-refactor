# 0001. Adopt Biome as the enforced lint, format and commit standard

**Date**: 2026-10-01
**Status**: Accepted

## Summary

Nothing enforces how this repo is written today. `AGENTS.md` states the conventions, every file is formatted by hand, and there is no linter or formatter config anywhere, so drift is invisible and a human has to catch it in review. This decision adopts Biome, one tool that lints, formats and orders imports from a single config, and wires it into three places: an npm script, a commit hook that fixes staged files, and CI. It also clears the 39 findings Biome finds in the current code in one sweep, so the gate starts green instead of permanently red.

## Requirements

**User stories**:

- As the maintainer, I want one command that tells me whether the repo matches its own written conventions, so that review attention goes to behavior instead of style.
- As the maintainer, I want a bad commit blocked before it leaves my machine, so that a CI failure means a real problem.
- As the next reader of this repo, I want the standard and its commands written down where I will look, so that I do not have to infer them from the surrounding code.

**Acceptance criteria** (the contract; the Standard definition below carries the detail):

- **AC-1**: `npm run check` exits 0 on a clean checkout once the sweep is done, and exits non zero when any file is unformatted, has unsorted imports, or has a lint finding at warning or error severity.
- **AC-2**: `npm run check:fix` and `npm run format` apply their fixes, after which AC-1 holds.
- **AC-3**: committing a staged file that is unformatted leaves the repo clean and commits the fixed content, because the hook fixes the file and re-stages it. A staged finding that cannot be fixed automatically blocks the commit with a non zero exit.
- **AC-4**: a fresh clone gets the hook from `npm install` alone, and the install step never fails where there is no git repository or no dev dependencies, which covers the Docker build and `npm ci --omit=dev`.
- **AC-5**: CI runs the check in the existing `test` job before typecheck, and a pull request that introduces any finding fails the job.
- **AC-6**: the config's values match the conventions in `AGENTS.md` (four space indentation, double quotes, semicolons, trailing commas, 100 character line width) with import organizing on, so a file that already follows the conventions passes untouched.
- **AC-7**: `build/`, `.react-router/`, `test-results/`, `public/`, `app/types/tmdb.generated.ts` and the lockfiles are neither checked nor formatted.
- **AC-8**: the new commands and the commit hook are written into the README `## Scripts` table for the next reader.

## Decision

**Chosen option**: Option 1: Biome as the only linter and formatter, enforced by script, commit hook and CI, with a single migration sweep.

Adopt `@biomejs/biome` (pinned to 2.5.15) as the repo's only linter and formatter, configured in `biome.json` to the conventions already written in `AGENTS.md` (four space indentation, double quotes, semicolons, trailing commas) at a 100 character line width, enforced by `npm run check`, a staged file commit hook in `.githooks/`, and one CI step, with the 39 existing findings cleared in the same pass.

## Standard definition

**Canonical pattern**:

Every file in the repo is checked and formatted by the config below, run through `npm run check` (read only, warnings fail), `npm run check:fix` (writes lint, format and import fixes) and `npm run format` (writes formatting only).

```json
// biome.json, repo root
{
    "$schema": "https://biomejs.dev/schemas/2.5.15/schema.json",
    "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
    "files": {
        "ignoreUnknown": true,
        "includes": [
            "**",
            "!**/build",
            "!**/.react-router",
            "!**/test-results",
            "!**/public",
            "!**/app/types/tmdb.generated.ts",
            "!**/package-lock.json",
            "!**/bun.lock"
        ]
    },
    "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 4, "lineWidth": 100 },
    "javascript": {
        "formatter": { "quoteStyle": "double", "semicolons": "always", "trailingCommas": "all" }
    },
    "linter": {
        "enabled": true,
        "domains": { "react": "recommended" },
        "rules": { "preset": "recommended", "correctness": { "noEmptyPattern": "off" } }
    },
    "assist": { "enabled": true, "actions": { "source": { "organizeImports": "on" } } },
    "css": { "parser": { "tailwindDirectives": true } }
}
```

The commit hook fixes staged files and re-stages them, so what you commit is already clean:

```sh
#!/bin/sh
# .githooks/pre-commit   (must be chmod +x, git only runs an executable hook)
set -e

BIOME="./node_modules/.bin/biome"
if [ ! -x "$BIOME" ]; then
    echo "Commit hook: Biome is not installed. Run npm install first." >&2
    exit 1
fi

"$BIOME" check --write --staged --error-on-warnings --no-errors-on-unmatched
git add -u
```

Scripts added to `package.json`:

```json
"check": "biome check --error-on-warnings",
"check:fix": "biome check --write",
"format": "biome format --write",
"prepare": "node scripts/setup-hooks.mjs"
```

`scripts/setup-hooks.mjs` points git at `.githooks` and never fails an install:

```js
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

// Docker runs npm ci with no .git and no dev dependencies; never break the install.
if (!existsSync(".git") || !existsSync(".githooks")) process.exit(0);

try {
    execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "ignore" });
} catch {
    process.exit(0);
}
```

`.vscode/settings.json` makes an editor save produce the same result as the gate, and `.vscode/extensions.json` offers the extension:

```json
{
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "quickfix.biome": "explicit",
        "source.organizeImports.biome": "explicit"
    }
}
```

```json
{ "recommendations": ["biomejs.biome"] }
```

**Replaces**:

- Hand formatting per file, with the rule in `AGENTS.md` being "match the surrounding file by hand".
- Unsorted imports, wherever a file happened to place them.
- No check before a commit. A style problem reached CI or review, or nobody.
- A CI job (`ci.yml`) that typechecks, tests, builds and verifies PWA artifacts, but never looked at style.

**Enforcement**:

| Where | What | Command |
|---|---|---|
| Local gate | Lint, format and import order over the whole repo, warnings fail | `npm run check` |
| Local write | The same, applying every safe fix | `npm run check:fix` |
| Local write | Formatting only | `npm run format` |
| Commit | Staged files fixed, re-staged, unfixable findings block the commit | `.githooks/pre-commit` |
| CI | `npm run check` as a step in the existing `test` job of `.github/workflows/ci.yml`, placed before `npm run typecheck` | `npm run check` |
| Editor | Format and organize imports on save | `.vscode/settings.json` |

Coverage: every `.ts`, `.tsx`, `.mjs`, `.css` and `.json` file in the repo, root config files included, plus the README table entry for the new commands. `.gitignore` is respected, so `build/`, `node_modules/` and `.react-router/` stay out, and the config additionally excludes `test-results/`, `public/` (static assets, including a generated logo SVG that fails an accessibility rule), `app/types/tmdb.generated.ts` (generated, never hand edited) and the lockfiles. JSON is formatted at the same four space width as code, so `package.json` and `tsconfig.json` are reindented once; npm preserves that indentation on later writes.

**Rollout**: single migration sweep, in this order.

1. Land the standard itself: `biome.json`, the `@biomejs/biome` 2.5.15 dev dependency and the four scripts in `package.json`, `scripts/setup-hooks.mjs`, `.githooks/pre-commit` (executable), `.vscode/settings.json`, `.vscode/extensions.json`, the CI step, and the new rows in the README `## Scripts` table.
2. Run `npm run check:fix` across the repo: 63 files reformatted, 62 files with imports ordered. Commit this mechanical pass on its own so the next commit is readable.
3. Clear the 39 lint findings: 24 errors and 15 warnings. 35 are fixed (13 accessibility, 6 array index keys, 1 hook dependency list, 4 unused imports, 2 unused parameters, 7 non null assertions, 1 import type, 1 duplicate enum value), using `check:fix` where the fix is safe and by hand where it is not. The four `useHookAtTopLevel` findings in `app/routes/profile.tsx` are suppressed instead (see Exceptions). The exact list with file and line is in [rationale.md](rationale.md).
4. `npm run check` exits 0 on a clean checkout, and a copy of the full list is now empty.

**Exceptions**:

- **The four rules of hooks violations in `app/routes/profile.tsx`** (lines 34, 84, 91, 102) are suppressed with a `// biome-ignore lint/correctness/useHookAtTopLevel: <why>` comment carrying a note that this is tracked as a separate bug fix, not a style question. Fixing them moves when hooks run, which is a behavior change and does not belong inside the tooling pass. See Follow-up.
- **`noEmptyPattern` is off repo wide.** React Router route modules destructure an empty object on purpose to get typed route args (`export function meta({}: Route.MetaArgs)`), which this rule flags. This is the rule fighting the framework, not a defect.
- **Generated, vendored and static files are excluded by config**: `app/types/tmdb.generated.ts`, the lockfiles, `public/`, `build/`, `.react-router/` and `test-results/`.
- **Deliberately partial staging**: the hook re-stages with `git add -u`, so other tracked modifications you left unstaged join the commit. Commit those separately, or use `git commit --no-verify` when the fix must not be applied.
- Otherwise none: every source, test and config file in the repo follows the standard, and the gate fails on warnings as well as errors.

## Consequences

**Positive**:

- One command reports the whole repo clean, and a bad commit is blocked locally and in CI.
- The conventions in `AGENTS.md` become executable instead of advisory, so review can spend its attention on behavior.
- The 39 cleared findings include 13 genuine accessibility defects and 4 rules of hooks violations that nothing had surfaced before.
- The gate costs about 15 ms over 109 files, so it is invisible on commit and in CI.

**Negative / tradeoffs**:

- The sweep is a large mechanical diff: about 63 files reformatted and 62 import orderings changed. It cannot be reviewed line by line, only accepted as a mechanical pass and then checked by the gate.
- The sweep destroys `git blame` attribution for those files, right before a pass that edits many of them.
- The hook writes to your working tree and runs `git add -u`, which can pull in changes you meant to keep out of the commit.
- `core.hooksPath` replaces the default `.git/hooks` directory, so any hook a developer added there stops running.
- Pinning Biome exactly means formatter output cannot shift under the team, at the cost of upgrades being a deliberate step, since a minor release can change formatting and fail the gate.
- The linter has no ESLint plugin ecosystem and no type aware rules, so a future need for either is a new decision that may supersede this spec.
- Biome ships its platform binary as an optional dependency. This repo already pins such binaries for rolldown, Tailwind oxide and lightningcss, so if CI or Docker fails to resolve Biome's binary on linux x64, pin `@biomejs/cli-linux-x64` in `optionalDependencies` in the same style.

**Neutral**:

- A fresh clone has no hook until `npm install` runs once. CI still gates whatever a hookless clone pushes.
- The four suppressions are visible debt with a named owner (the Follow-up item), rather than a gap nobody knows about.
- `bun.lock` remains in the repo untouched by this standard; the project uses npm and `package-lock.json`.

## Follow-up

- [ ] Fix the four rules of hooks violations in `app/routes/profile.tsx` (lines 34, 84, 91, 102) and remove the four `biome-ignore` comments. This changes when hooks run, so it belongs in its own bug fix with a check of the profile tabs. Consider enrolling it with `/scope`.
- [ ] `/sync` to add `check`, `check:fix` and `format` to the root `AGENTS.md` `## Commands` section, describe the enforced standard in `## Rules`, and delete the now false line "There is no ESLint or Prettier config, so match the surrounding file by hand."
- [ ] Verify the Docker build and the CI run resolve Biome's platform binary (`npm ci --legacy-peer-deps` in `node:22-alpine`), and pin `@biomejs/cli-linux-x64` if they do not. Confirm that `npm ci --omit=dev` in the production stage still succeeds now that a `prepare` script exists.
- [ ] Consider enabling `lint/nursery/useSortedClasses` for Tailwind class order in a later change: 249 occurrences across 38 files today, a nursery rule with an unsafe fix.
- [ ] Consider deleting the stale `bun.lock` (about 380 KB), since the project uses npm and `package-lock.json`.
- [ ] If format on save does not organize imports, confirm the Biome extension's code action ids (`quickfix.biome`, `source.organizeImports.biome`) against the version installed.

## Rationale

Reasoning, the options weighed and the measurements behind every number in this spec: [rationale.md](rationale.md).
