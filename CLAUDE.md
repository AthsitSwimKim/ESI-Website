# ESI Website — Claude project notes

Corporate website redesign for Engineering System Integration Co., Ltd. (ESI), Rayong.
Frontend-only static site: React 19 + TypeScript + Vite + Tailwind v4 + React Router v7 +
motion + lucide-react. No backend, database, auth, CMS or uploads — ever.

## Start here

- **Skill:** `.claude/skills/esi-website/SKILL.md` — load it for ANY change in this repo
  (design tokens, mockup crops, content, architecture, verification steps).
- **Plan / status:** `PLAN.md` — phase checklists, decisions (D1–D15), content still needed.
  Work in phase order; tick boxes and update the status line when a task is done.
- **Look & feel:** the homepage mockup in `.claude/skills/esi-website/assets/` is the visual
  authority. Compare every section against its crop before calling it done.

## Conventions

- Content lives in `src/data/*.ts` (never hardcoded in JSX); UI strings go through `t()`.
- Colours only from the `@theme` tokens (`esi-blue`, `esi-navy`, `esi-accent`, …).
- Section titles: Kanit, bold italic uppercase, left-aligned with the 40×3 bar.
- Verify with `npm run typecheck && npm run lint && npm run build`, then check in the browser.
- The user writes Thai — reply in Thai with English technical terms.

## Git workflow

- The owner decides when a branch is opened — **do not create branches unprompted**. When they
  ask for one: `git switch -c feat/<name>` from `main`, commit there, merge back with a merge
  commit (`merge.ff=false` is set) and push both, so Git Graph shows the line.
- Commit / push only when asked. **Commit messages in Thai** (English technical terms are fine),
  descriptive subject + short body, e.g. `เพิ่มหน้า Solutions และ template รายละเอียด 6 หน้า (Phase 5)`.
- `git graph` / `git lg` show the graph in the terminal.
