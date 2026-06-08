# CLAUDE.md — נחמד במלר"ד
_Project rules & stack — do not modify mid-session_

## Project
אפליקציית מאגר פרוטוקולים רפואיים למלר"ד הדסה עין כרם.
URL: https://nehmad-bamalrad.vercel.app
Repo: https://github.com/E2Je/nehmad-bamalrad

## Stack
- React 18 + Vite + TypeScript
- Tailwind CSS (darkMode: 'class', primary: #1a3f7a)
- Font: Heebo | Direction: RTL Hebrew
- Hosting: Vercel (Hobby plan)
- Storage: GitHub API → protocols/ folder + protocols.json manifest
- Search: Fuse.js

## Constraints
- Mobile-first (Android Chrome primary target)
- Vercel Hobby: serverless body limit 4.5MB — large file uploads bypass Vercel via direct GitHub API
- GitHub Contents API: max 100MB per file
- No database — protocols.json at repo root is the single source of truth
- Admin codes: 06918, 35321 (client-side gate + server-side verification in /api/get-upload-token)

## API Endpoints (/api/)
| File | Purpose |
|---|---|
| get-upload-token.js | Verify admin code → return GITHUB_TOKEN |
| register-protocol.js | Update protocols.json manifest |
| upload.js | Legacy small-file upload (kept for compatibility) |
| update-protocol.js | Edit protocol metadata |
| delete-protocol.js | Remove from manifest |
| update-categories.js | Update categories array |

## Key Rules
- Category IDs: always use `cat_${Date.now()}` — Hebrew chars break \w regex
- Category duplicate check: by label, NOT by id
- Image upload: compress to 1920px max, 82% JPEG via canvas before upload
- Dark mode: toggled via className on root div in App.tsx
- Sticky top bar: Header + SearchBar + CategoryFilter wrapped in single sticky div
- Android back button: History API pushState when modals open
- Never commit GITHUB_TOKEN to source — Vercel env var only
