# primer.md — נחמד במלר"ד
_Last updated: 2026-05-31_

## Active Sprint
תחזוקה שוטפת + תיקון bugs + שיפורי UX

## Completed This Session
- העלאה דו-שלבית: get-upload-token → XHR ישיר לGitHub → register-protocol (מסיר מגבלת גודל Vercel)
- מד התקדמות XHR אמיתי עם אחוזים + אזהרת "אל תסגור דף"
- דחיסת תמונות client-side (canvas 1920px, 82% JPEG)
- תיקון "bad credentials" — token.trim() ב-get-upload-token
- שיפור הודעות שגיאה ספציפיות (auth:401 vs auth:500)
- יצירת CLAUDE.md, primer.md, hindsight.md, knowledge files

## Current State
- אפליקציה פעילה ומעלה קבצים עד 100MB
- כל הפיצ'רים עובדים: חיפוש, קטגוריות, dark mode, admin, FileViewer
- Vercel Analytics פעיל
- OG image מוגדר לשיתוף WhatsApp

## Next Steps
- למידה אוטומטית של תגיות מהמאגר הקיים (במקום מפה סטטית)
- שיקול multi-tenant למחלקות נוספות

## Open Blockers
- אין כרגע
