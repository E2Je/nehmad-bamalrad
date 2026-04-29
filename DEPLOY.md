# מדריך דיפלוי - נחמד במלר"ד

## שלב 1: GitHub Token

1. היכנס ל-github.com עם המשתמש E2Je
2. לחץ על תמונת הפרופיל (ימין למעלה) → Settings
3. גלול למטה → Developer settings (בתחתית התפריט)
4. Personal access tokens → Tokens (classic)
5. Generate new token (classic)
6. שם: `nehmad-bamalrad`
7. תוקף: No expiration (או שנה)
8. הרשאות: סמן את ✅ **repo** (כל תת-האפשרויות נכללות)
9. לחץ Generate token
10. **העתק את הטוקן עכשיו** - הוא מוצג פעם אחת בלבד!

---

## שלב 2: הכנת ה-Repo

ב-repo https://github.com/E2Je/nehmad-bamalrad צריכים להיות:

```
/
├── protocols.json          ← תיצור בשלב 4
├── protocols/              ← תיקייה לקבצים (תיווצר אוטומטית בהעלאה)
└── README.md               ← אם אין, צור אחד ריק
```

### יצירת protocols.json בגיטהאב:
1. כנס ל-repo
2. Add file → Create new file
3. שם קובץ: `protocols.json`
4. תוכן - העתק מ-`src/data/protocols.json` בפרויקט
5. Commit changes

### העלאת הלוגו:
1. Add file → Upload files
2. העלה את `logo.png` לתיקיית `public/`
   (או שמור אותו ב-`public/logo.png` בפרויקט לפני הבנייה)

---

## שלב 3: Netlify

1. כנס ל-[netlify.com](https://netlify.com) ורשום חשבון (חינמי)
2. לחץ **Add new site** → **Import an existing project**
3. בחר **GitHub** → אשר חיבור → בחר repo `nehmad-bamalrad`
4. הגדרות Build:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. לחץ **Deploy site**
6. המתן לסיום הבנייה (2-3 דקות)

---

## שלב 4: הגדרת ה-Token ב-Netlify

1. ב-Netlify → Site settings → Environment variables
2. לחץ **Add a variable**
3. Key: `GITHUB_TOKEN`
4. Value: הטוקן שהעתקת בשלב 1
5. Scopes: All (ברירת מחדל)
6. Save → **Trigger redeploy** (כדי שהפונקציות יטענו את הטוקן)

---

## שלב 5: בדיקה

1. פתח את כתובת ה-Netlify שלך (למשל: `nehmad-bamalrad.netlify.app`)
2. לחץ על מגן הניהול (ימין למעלה)
3. הכנס קוד: `06918` או `35321`
4. נסה להעלות תמונה לדוגמה
5. ודא שהקובץ הופיע ב-repo בגיטהאב תחת `protocols/`

---

## פתרון בעיות

| בעיה | פתרון |
|------|--------|
| "GitHub token not configured" | בדוק שהוספת GITHUB_TOKEN ב-Netlify env vars ועשית redeploy |
| קובץ לא מוצג אחרי העלאה | לרענן את הדף - הנתונים מגיטהאב עם עיכוב קל |
| תמונה לא נטענת בצפייה | בדוק שנתיב הקובץ ב-protocols.json נכון |
| שגיאת CORS | הקובץ חייב להיות ב-repo **ציבורי** (Public) |
