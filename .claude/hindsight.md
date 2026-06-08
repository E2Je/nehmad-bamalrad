# hindsight.md — נחמד במלר"ד
_Patterns extracted from multiple sessions — do not invent entries_

## Bugs That Recur
- **Hebrew IDs**: `/[^\w-]/g` strips all Hebrew chars → always use `cat_${Date.now()}` for category IDs
- **Tag suggestions after file select**: `handleTitleChange` had `if (!file)` guard → removed, now always updates
- **Vercel body limit**: 4.5MB hard limit → must bypass with direct GitHub XHR for file uploads
- **Token whitespace**: GitHub token from Vercel env can have trailing newline → always `.trim()`

## What the User Prefers
- הודעות שגיאה ספציפיות בעברית (לא generic "שגיאה")
- קוד קצר ומודולרי — לא rewrites מיותרים
- push לגיטהאב בסוף כל שינוי
- אישור עם צילום מסך לפני שנחשב משהו "עובד"

## Approaches That Failed
- `exports.handler` (Netlify syntax) ב-Vercel → צריך `export default function handler(req, res)`
- `fetch` API לא תומך ב-upload progress → חייב XHR
- העלאת קבצים דרך Vercel לקבצים גדולים → תמיד 413
- `history.pushState` ללא ניקוי ב-onClose → back button לוחץ פעמיים

## Shortcuts That Work
- `git stash && git pull --rebase && git stash pop && git push` לפתרון rebase conflicts
- `npx tsc --noEmit` לפני כל commit
- `git commit --allow-empty` לטריגר redeploy ב-Vercel

## Performance Notes
- 4 network requests בעלאה החדשה (לעומת 1 בישנה) — מורגש על מובייל
- Google Docs Viewer איטי — spinner נדרש
- תמונות ל-GitHub raw מהירות (CDN) — אין צורך ב-lazy loading אגרסיבי
