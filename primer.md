# primer.md - נחמד במלר"ד
_Last updated: 2026-04-30_

## Active Sprint
אפליקציית פרוטוקולים למלר"ד הדסה עין כרם — תחזוקה ושיפורים שוטפים.

## Stack
- React 18 + Vite + TypeScript + Tailwind CSS
- Hosting: Vercel (https://nehmad-bamalrad.vercel.app)
- Backend: GitHub API (repo: E2Je/nehmad-bamalrad) via Vercel serverless functions in `/api/`
- Auth: GITHUB_TOKEN env var in Vercel (Production + Preview only)
- Font: Heebo, RTL Hebrew

## File Map
```
src/
  App.tsx               — main layout, state, dark mode, back-button history API
  main.tsx              — entry point + Vercel Analytics
  index.css             — global styles + dark mode overrides
  components/
    Header.tsx          — sticky, scroll-shrink, dark mode toggle, NotebookLM link
    SearchBar.tsx       — fuzzy search input
    CategoryFilter.tsx  — sliding pill animation, counts badges, collapses on search
    ProtocolCard.tsx    — category-colored right border, thumbnail for images, date badge
    FileViewer.tsx      — image viewer with pinch-to-zoom + pan, PDF/Word via Google Docs Viewer
    AdminPanel.tsx      — login (codes: 06918, 35321), upload, edit, delete, tag suggestions, emoji picker
  hooks/
    useSearch.ts        — Fuse.js fuzzy search with Hebrew/English ambiguity
  types/
    index.ts            — Protocol, Category, FileType types
  data/
    protocols.json      — bundled fallback (empty protocols, 6 base categories)
api/
  upload.js             — upload file to GitHub + update protocols.json manifest
  update-protocol.js    — update protocol metadata
  delete-protocol.js    — remove protocol from manifest
  update-categories.js  — update categories array
public/
  logo.png              — app logo
  logo.svg              — SVG fallback
  og-image.png          — 1200x630 OG image for link previews
protocols.json          — LIVE manifest at repo root (fetched at runtime)
index.html              — OG meta tags, theme color #1a3f7a
```

## Completed This Session
- UX/UI redesign: dark mode, sliding category pill, skeleton loading, card right-border by category
- Header: scroll-shrink compact mode, dark mode toggle (Sun/Moon)
- SearchBar: categories collapse when searching
- ProtocolCard: image thumbnail restored, date badge, +N tags
- FileViewer: pinch-to-zoom + horizontal pan
- App: Android back button closes modals (History API)
- Sticky top bar (header + search + categories)
- Footer credit: © איתמר גרינברג + ליאורה לוי
- OG image for WhatsApp/link previews
- Vercel migration from Netlify (api/ functions, ES module exports)
- Vercel Analytics added
- Category bug fix: Hebrew names now use `cat_${Date.now()}` as ID
- Tag suggestions fix: update on title change even after file selected
- Back button (Android) closes FileViewer/AdminPanel instead of exiting browser

## Key Decisions Made
- GitHub as file storage (not Drive/S3) — simplicity, no extra auth
- Vercel serverless functions proxy GitHub API — token never exposed client-side
- protocols.json at repo root as live manifest — fetched on app mount, fallback to bundled
- Category IDs use `cat_${Date.now()}` — avoids Hebrew stripping bug with \w regex
- Duplicate category check by label, not ID
- Google Docs Viewer for PDF/Word (users have cellular data, not hospital WiFi restricted)
- darkMode: 'class' in Tailwind — toggled via root div className

## Open Blockers
- None currently

## Next Step
שיכפול למחלקות נוספות (multi-tenant) אם יתקדם הרעיון
