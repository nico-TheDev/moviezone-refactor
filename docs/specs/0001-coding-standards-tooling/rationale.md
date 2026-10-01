# Rationale: Adopt Biome as the enforced lint, format and commit standard

Decision record for [index.md](index.md). The build spec lives there; this file is the reasoning and the measurements behind it.

## Context

`AGENTS.md` already states the conventions: four space indentation, double quotes, semicolons, trailing commas, one way data flow, named exports, no component library. Nothing checks any of it. There is no linter and no formatter config anywhere in the repo, so the rule the context file gives a reader is to match the surrounding file by hand. That works only while a human notices, and it degrades quietly.

The codebase is about 103 source files (76 in `app/`, 16 in `tests/`, 8 in `server/`, plus `e2e/` and `scripts/`), one Tailwind v4 stylesheet and a handful of root config files. It is a solo portfolio project on npm (`legacy-peer-deps=true`), CI and Docker on Node 22, TypeScript 5 strict with `verbatimModuleSyntax` on, and a CI job that already typechecks, tests, builds and verifies PWA artifacts.

Two forces shape the timing. The scope says the rest of this hardening pass edits many existing files, so a standard adopted now avoids reformatting work that is about to move, and a standard adopted later means reformatting those files twice. The other force is cost: the check has to be fast enough to run on every commit without anyone thinking about it, and it has to work in the Docker build, where `npm ci` runs with no `.git` directory present.

The consequence of not deciding is that the tooling box in the scope stays open, and every later feature in this pass lands unenforced code.

## Options considered

### Option 1: Biome, enforced, with a single migration sweep (chosen)

One Rust binary provides linting, formatting and import organizing for TypeScript, TSX, CSS and JSON from one config file, with a React rule domain that covers the hooks rules this codebase actually violates.

**Pros**:
- One dev dependency, one config, one command. Nothing to keep in sync and no plugin matrix to maintain.
- Fast: 109 files checked in about 15 ms, so it is free on commit and in CI.
- It found 39 real findings in the current code, including 13 accessibility defects and 4 rules of hooks violations, with no tuning.
- Verified against this repo before deciding: it parses the Tailwind 4 stylesheet once the directive parser is on, and it accepts the whole config above without an unknown key.

**Cons**:
- No type aware linting and no plugin ecosystem. A rule that needs the TypeScript type checker, or a bespoke project rule, is out of reach.
- The sweep is a large mechanical diff across most of the repo.
- A nursery rule set (Tailwind class order) exists but is explicitly unstable.

### Option 2: Biome, enforced for new code only, existing violations tracked as debt

The same tool and config, but no sweep: the gate runs on new and changed files, and the existing 149 findings become a tracked list.

**Pros**:
- No large mechanical diff, so `git blame` and any open work survive untouched.
- The standard is real from day one for everything written after it.

**Cons**:
- The whole repo command can never report clean, which is exactly what the scope's Done when asks for.
- A gate that is permanently red teaches people to ignore it, which is worse than no gate.

### Option 3: ESLint plus Prettier

The conventional pair: typescript-eslint with the React hooks and refresh plugins for lint, Prettier for format, `eslint-config-prettier` to stop them disagreeing.

**Pros**:
- The largest rule and plugin ecosystem, type aware rules available, and near universal familiarity.
- Prettier's formatting is the ecosystem default, so editor and CI integrations are everywhere.

**Cons**:
- Roughly six dev dependencies and two configs, plus a third integration package to keep them from fighting, for a solo project whose needs the single tool already covers.
- Two tools and two configs is two places for the standard to drift.

### Option 4: Document only, no automation

Write the standard down and rely on review, which is close to the current state with better wording.

**Pros**:
- Zero tooling, zero install cost, nothing to break.

**Cons**:
- This is the situation the scope feature exists to end. Review already misses these findings; the 39 findings are the evidence.

## Rationale

The deciding forces are a solo maintainer, a small and conventional TypeScript codebase, and a gate that must be invisible on every commit. Biome answers all three with one dependency and one config, and it demonstrated on this repo that it covers what matters here: the React hooks rules that caught four real violations, the accessibility rules that caught thirteen, and formatting that already matches the conventions in `AGENTS.md` closely enough that a sweep is mechanical rather than contentious. ESLint plus Prettier would be the right call for a team needing type aware rules or custom plugins; paying six dependencies for that today buys nothing this codebase uses.

The sweep over enforcement for new code only follows directly from the scope's Done when (one command lints and formats the repo clean) and from the maintainer's interest: a gate that fails on untouched code is a gate people learn to bypass. Doing the sweep now is also cheaper than doing it later, because the rest of this pass edits many of the same files, and reformatting them twice costs two rounds of churn.

Suppressing the four rules of hooks violations rather than fixing them here keeps the tooling change honest about what it is. Moving hooks above early returns changes when they run in the profile route, so it needs its own verification of the profile tabs, and it is the kind of change that deserves a commit a reviewer can read on its own. The suppression is visible and tracked, not hidden.

Fixing the 13 accessibility findings here rather than deferring them to the planned Accessibility pass (scope feature 16) is deliberate. Leaving the accessibility rules on and the findings unfixed is not possible with a clean gate, and turning the rules off makes the linter blind to a whole class of defect for the rest of the pass. Clearing them now means feature 16 can spend its effort on the harder parts, focus trapping and restoring in the modal and the drawer, and the automated check in CI.

## Evidence

Measured on 2026-10-01 with Biome 2.5.15 fetched through `npx` and run read only against a copy of the tree. Nothing was written into the repo during the decision.

| Measurement | Result |
|---|---|
| Files covered by the config | 109 |
| Files needing formatting at 100 character width | 63 |
| Files needing formatting at 80 character width (runner up, rejected) | 74 |
| Files whose imports would be reordered | 62 |
| Lint findings, chosen rule set | 39 (24 errors, 15 warnings) across 24 files |
| Gate runtime | about 15 ms over 109 files |
| `useSortedClasses` (nursery, not enabled) | 249 occurrences across 38 files |

Verified during the decision, because each one changes the config or the hook:

| Check | Finding |
|---|---|
| Tailwind stylesheet | Biome refuses to parse `app/app.css` until `css.parser.tailwindDirectives` is on. The CLI flag name is `--css-parse-tailwind-directives`. |
| React rules | They activate through the React domain, so `linter.domains: { "react": "recommended" }` is set explicitly rather than left to detection from `package.json`. `domains` is an object, not an array. |
| Staged writes | `biome check --write --staged` edits the working tree and leaves the index stale (git reports `MM`), so the hook needs `git add -u` to actually commit the fix. |
| Staged scope | `biome check --staged` checks only what is staged: one staged file reports one file checked. `--no-errors-on-unmatched` is needed for a commit with nothing staged. |
| JSON indentation | After formatting `package.json` to four spaces, `npm pkg set` rewrote the file and kept four spaces, so npm will not fight the formatter. |
| `public/` | A repository wide include lints `public/moviedb-logo.svg` and fails `a11y/noSvgWithoutTitle` on a static asset, which is why `public/` is excluded. |
| Docker | The Dockerfile runs `npm ci` after copying only `package.json` and the lockfile, so no `.git` exists at that point and the `prepare` script must exit quietly instead of failing the build. The production stage runs `npm ci --omit=dev`, so the script must not depend on dev dependencies. |
| `tsconfig.json` | At 100 character width Biome collapses the `include` array onto one line, which is the only change to that file. |

### The 39 lint findings to clear

Errors, 24 in total.

| Rule | Location | What it means |
|---|---|---|
| `correctness/useHookAtTopLevel` | `app/routes/profile.tsx:34` | Hook called indirectly and conditionally |
| `correctness/useHookAtTopLevel` | `app/routes/profile.tsx:84` | Hook called conditionally |
| `correctness/useHookAtTopLevel` | `app/routes/profile.tsx:91` | Hook called conditionally |
| `correctness/useHookAtTopLevel` | `app/routes/profile.tsx:102` | Hook called conditionally |
| `correctness/useExhaustiveDependencies` | `app/routes/genre-browse.tsx:48` | Hook lists more dependencies than it uses |
| `suspicious/noArrayIndexKey` | `app/components/GenreList.tsx:20` | Array index used as a React key |
| `suspicious/noArrayIndexKey` | `app/components/MediaCarouselSkeleton.tsx:23` | Array index used as a React key |
| `suspicious/noArrayIndexKey` | `app/components/MediaDetailsSkeleton.tsx:13` | Array index used as a React key |
| `suspicious/noArrayIndexKey` | `app/components/MediaDetailsSkeleton.tsx:21` | Array index used as a React key |
| `suspicious/noArrayIndexKey` | `app/components/MediaGrid.tsx:64` | Array index used as a React key |
| `suspicious/noArrayIndexKey` | `app/routes/season-details.tsx:118` | Array index used as a React key |
| `a11y/noNoninteractiveElementToInteractiveRole` | `app/components/GenreMultiSelect.tsx:73` | `ul` given an interactive role |
| `a11y/noNoninteractiveElementToInteractiveRole` | `app/components/GenreMultiSelect.tsx:79` | `li` given an interactive role |
| `a11y/useFocusableInteractive` | `app/components/GenreMultiSelect.tsx:79` | Element with role `option` is not focusable |
| `a11y/useKeyWithClickEvents` | `app/components/MediaCarousel.tsx:105` | Click handler with no keyboard equivalent |
| `a11y/noStaticElementInteractions` | `app/components/MediaCarousel.tsx:105` | Event handler on a static element |
| `a11y/useKeyWithClickEvents` | `app/components/ui/Modal.tsx:32` | Click handler with no keyboard equivalent |
| `a11y/useKeyWithClickEvents` | `app/components/ui/Modal.tsx:37` | Click handler with no keyboard equivalent |
| `a11y/noStaticElementInteractions` | `app/components/ui/Modal.tsx:37` | Event handler on a static element |
| `a11y/useSemanticElements` | `app/components/MediaGridCard.tsx:28` | Role could be a real semantic element |
| `a11y/useButtonType` | `app/components/MediaCarousel.tsx:222` | Button without an explicit `type` |
| `a11y/useButtonType` | `app/components/MediaCarousel.tsx:230` | Button without an explicit `type` |
| `a11y/useValidAnchor` | `app/components/layout/Footer.tsx:22` | Anchor with an invalid `href` |
| `a11y/useValidAnchor` | `app/components/layout/Footer.tsx:27` | Anchor with an invalid `href` |

Warnings, 15 in total.

| Rule | Location | What it means |
|---|---|---|
| `correctness/noUnusedImports` | `app/components/MediaCarousel.tsx:2` | Unused imports |
| `correctness/noUnusedImports` | `app/queries/media.queries.ts:11` | Unused imports |
| `correctness/noUnusedImports` | `app/routes/media-details.tsx:5` | Unused imports |
| `correctness/noUnusedImports` | `server/auth-routes.ts:4` | Unused import |
| `correctness/noUnusedFunctionParameters` | `app/components/HeroFeaturedCarousel.tsx:189` | Unused parameter `mediaType` |
| `correctness/noUnusedFunctionParameters` | `app/routes/genre-browse.tsx:22` | Unused parameter `params` |
| `style/noNonNullAssertion` | `app/components/MediaActionButtons.tsx:49` | Non null assertion |
| `style/noNonNullAssertion` | `app/components/MediaActionButtons.tsx:52` | Non null assertion |
| `style/noNonNullAssertion` | `app/components/MediaActionButtons.tsx:59` | Non null assertion |
| `style/noNonNullAssertion` | `app/components/MediaActionButtons.tsx:62` | Non null assertion |
| `style/noNonNullAssertion` | `app/utils/genre-helpers.ts:38` | Non null assertion |
| `style/noNonNullAssertion` | `app/utils/genre-helpers.ts:78` | Non null assertion |
| `style/noNonNullAssertion` | `app/utils/gravatar.ts:62` | Non null assertion |
| `style/useImportType` | `app/components/MediaCarousel.tsx:4` | Default import used only as a type |
| `suspicious/noDuplicateEnumValues` | `app/constants/api.ts:7` | Duplicate enum member value |
