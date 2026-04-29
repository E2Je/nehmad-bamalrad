import { useState, useRef } from 'react'
import { X, Upload, CheckCircle, AlertCircle, Loader, Edit2, Trash2, ChevronRight, Plus, Sparkles } from 'lucide-react'
import { Protocol, Category, FileType } from '../types'

const ADMIN_CODES = ['06918', '35321']

interface AdminPanelProps {
  protocols: Protocol[]
  categories: Category[]
  onClose: () => void
  onProtocolsChange: (p: Protocol[]) => void
  onCategoriesChange: (c: Category[]) => void
}

type Tab = 'upload' | 'categories'
type UploadStatus = 'idle' | 'uploading' | 'done' | 'error'

const EMOJI_OPTIONS = ['💉','💊','🧪','📋','🩺','❤️','🏥','📁','🔬','🩹','⚕️','🩻','📝','🫀','🫁','🧠','🦷','👁️','🧬','💆']

function detectFileType(file: File): FileType {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['doc','docx'].includes(ext)) return 'word'
  if (['ppt','pptx'].includes(ext)) return 'ppt'
  return 'image'
}

function suggestTags(filename: string, title: string): string[] {
  const combined = (filename + ' ' + title).toLowerCase()
  const map: Record<string, string[]> = {
    'קטמין':        ['קטמין','ketamine','הרדמה','sedation','dissociative','IV'],
    'ketamine':     ['קטמין','ketamine','הרדמה','sedation','dissociative'],
    'פנטניל':       ['פנטניל','fentanyl','כאב','אנלגזיה','אופיואיד','IV','drip'],
    'fentanyl':     ['פנטניל','fentanyl','כאב','אנלגזיה','אופיואיד'],
    'מורפין':       ['מורפין','morphine','כאב','אופיואיד','אנלגזיה','PCA'],
    'morphine':     ['מורפין','morphine','כאב','אופיואיד','אנלגזיה'],
    'אינסולין':     ['אינסולין','insulin','סוכר','סוכרת','גלוקוז','היפרגליקמיה','דצ"ל'],
    'insulin':      ['אינסולין','insulin','סוכר','סוכרת','גלוקוז'],
    'נתרן':         ['נתרן','sodium','היפונתרמיה','NaCl 3%','אלקטרוליטים','ODS'],
    'hyponatr':     ['היפונתרמיה','נתרן נמוך','sodium','NaCl 3%','אלקטרוליטים','ODS'],
    'אנטיביוטיקה':  ['אנטיביוטיקה','antibiotics','IV','הזרקה','זיהום','infection'],
    'antibiotic':   ['אנטיביוטיקה','antibiotics','IV','infection'],
    'ונקומיצין':    ['ונקומיצין','vancomycin','אנטיביוטיקה','MRSA','IV'],
    'vancomycin':   ['ונקומיצין','vancomycin','MRSA','אנטיביוטיקה'],
    'מרופנם':       ['מרופנם','meropenem','carbapenem','אנטיביוטיקה','IV'],
    'דריף':         ['דריף','drip','עירוי','infusion','IV','pump'],
    'drip':         ['דריף','drip','עירוי','infusion','IV'],
    'היפו':         ['היפוגליקמיה','סוכר נמוך','hypoglycemia','גלוקוז','D50'],
    'dka':          ['DKA','קטואצידוזיס','סוכרת','סוכר גבוה','אינסולין','אשלגן'],
    'לחץ דם':      ['לחץ דם','BP','היפוטנסיה','shock','עירוי'],
    'קרישה':       ['קרישה','coagulation','anticoagulant','הפרין','heparin','INR'],
    'הרדמה':       ['הרדמה','sedation','anesthesia','RSI','אינטובציה'],
    'אינטובציה':   ['אינטובציה','intubation','RSI','airway','הרדמה'],
    'intubat':      ['אינטובציה','intubation','RSI','airway'],
    'חמצן':        ['חמצן','oxygen','O2','סטורציה','SpO2','נשימה'],
    'ספירומטריה':  ['ספירומטריה','spirometry','FEV','ריאות'],
    'פרוטוקול':    ['פרוטוקול','protocol','הנחיה'],
    'טבלה':        ['טבלה','table','מינון','dosage'],
    'חירום':       ['חירום','emergency','קוד'],
    'קרדיו':       ['קרדיולוגיה','לב','cardiac','EKG','ECG'],
    'ekg':          ['EKG','ECG','לב','קרדיולוגיה','cardiac'],
    'נוירו':       ['נוירולוגיה','מוח','stroke','CVA'],
    'stroke':       ['stroke','CVA','נוירולוגיה','מוח','tPA'],
    'sepsis':       ['ספסיס','sepsis','זיהום','אנטיביוטיקה','shock'],
    'ספסיס':       ['ספסיס','sepsis','זיהום','shock','אנטיביוטיקה'],
    'כאב':         ['כאב','pain','אנלגזיה','VAS','אופיואיד'],
  }
  const suggestions: string[] = []
  for (const [key, tags] of Object.entries(map)) {
    if (combined.includes(key)) suggestions.push(...tags)
  }
  return [...new Set(suggestions)].slice(0, 10)
}

// ── Tags component ────────────────────────────────────────────────────────────
interface TagsSectionProps {
  suggested: string[]
  confirmed: string[]
  onAccept: (tag: string) => void
  onAcceptAll: () => void
  onRemove: (tag: string) => void
  onAddManual: (tag: string) => void
}

function TagsSection({ suggested, confirmed, onAccept, onAcceptAll, onRemove, onAddManual }: TagsSectionProps) {
  const [input, setInput] = useState('')
  const pendingSuggestions = suggested.filter((t) => !confirmed.includes(t))

  function submit() {
    const v = input.trim()
    if (v && !confirmed.includes(v)) { onAddManual(v) }
    setInput('')
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">מילות חיפוש</label>

      {/* AI suggestions */}
      {pendingSuggestions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <Sparkles size={13} />
              הצעות אוטומטיות
            </span>
            <button
              onClick={onAcceptAll}
              className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-full transition-colors"
            >
              קבל הכל
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {pendingSuggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => onAccept(tag)}
                className="flex items-center gap-1 bg-white border border-amber-300 text-amber-800 text-xs px-2.5 py-1.5 rounded-full hover:bg-amber-100 active:scale-95 transition-all font-medium"
              >
                <Plus size={11} />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed tags */}
      {confirmed.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {confirmed.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1.5 rounded-full font-medium"
            >
              {tag}
              <button
                onClick={() => onRemove(tag)}
                className="text-primary/60 hover:text-primary ml-0.5"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Manual input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }}
          placeholder="הוסף מילת חיפוש ידנית..."
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={submit}
          disabled={!input.trim()}
          className="bg-primary text-white px-4 rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center gap-1"
        >
          <Plus size={15} />
          הוסף
        </button>
      </div>

      {confirmed.length === 0 && pendingSuggestions.length === 0 && (
        <p className="text-xs text-gray-400 text-center">הכנס כותרת או בחר קובץ לקבלת הצעות אוטומטיות</p>
      )}
    </div>
  )
}

// ── Login screen ───────────────────────────────────────────────────────────────
function LoginSheet({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  function attempt() {
    if (ADMIN_CODES.includes(code.trim())) { onSuccess() }
    else { setError(true); setCode('') }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 modal-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">כניסת מנהל</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100"><X size={18} /></button>
        </div>
        <input
          type="password"
          inputMode="numeric"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(false) }}
          onKeyDown={(e) => e.key === 'Enter' && attempt()}
          placeholder="הכנס קוד גישה"
          autoFocus
          className={`w-full border-2 rounded-2xl px-4 py-3.5 text-center text-2xl tracking-widest font-mono outline-none transition-colors ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary'}`}
        />
        {error && <p className="text-red-500 text-sm text-center mt-2">קוד שגוי, נסה שוב</p>}
        <button onClick={attempt} className="w-full mt-4 bg-primary text-white py-3.5 rounded-2xl font-bold text-lg">
          כניסה
        </button>
      </div>
    </div>
  )
}

// ── Main admin panel ───────────────────────────────────────────────────────────
export default function AdminPanel({ protocols, categories, onClose, onProtocolsChange, onCategoriesChange }: AdminPanelProps) {
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<Tab>('upload')

  // Upload form
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [selCategory, setSelCategory] = useState(categories[0]?.id ?? '')
  const [description, setDescription] = useState('')
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [confirmedTags, setConfirmedTags] = useState<string[]>([])
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadMsg, setUploadMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editTagsRaw, setEditTagsRaw] = useState('')

  // Categories
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('📁')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [catMsg, setCatMsg] = useState('')

  if (!authed) {
    return <LoginSheet onSuccess={() => setAuthed(true)} onClose={onClose} />
  }

  // ── Handlers ──

  function handleFileChange(f: File) {
    setFile(f)
    const auto = f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    if (!title) setTitle(auto)
    const suggestions = suggestTags(f.name, title || auto)
    setSuggestedTags(suggestions)
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!file) {
      const suggestions = suggestTags('', val)
      setSuggestedTags(suggestions)
    }
  }

  function acceptTag(tag: string) {
    if (!confirmedTags.includes(tag)) setConfirmedTags((prev) => [...prev, tag])
  }

  function acceptAllTags() {
    const pending = suggestedTags.filter((t) => !confirmedTags.includes(t))
    setConfirmedTags((prev) => [...new Set([...prev, ...pending])])
  }

  function removeTag(tag: string) {
    setConfirmedTags((prev) => prev.filter((t) => t !== tag))
  }

  function addManualTag(tag: string) {
    setConfirmedTags((prev) => [...new Set([...prev, tag])])
  }

  function resetForm() {
    setFile(null); setTitle(''); setDescription('')
    setSuggestedTags([]); setConfirmedTags([])
    setUploadStatus('idle'); setUploadMsg('')
  }

  async function handleUpload() {
    if (!file || !title || !selCategory) return
    setUploadStatus('uploading')
    setUploadMsg('מעלה קובץ לגיטהאב...')

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1]
        const safeName = file.name.replace(/\s+/g, '-')

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: safeName,
            content: base64,
            title,
            category: selCategory,
            tags: confirmedTags,
            fileType: detectFileType(file),
            description,
          }),
        })

        if (!res.ok) throw new Error(await res.text())

        const { protocol: newP } = await res.json()
        onProtocolsChange([...protocols, newP])
        setUploadStatus('done')
        setUploadMsg('הקובץ הועלה בהצלחה!')
        setTimeout(resetForm, 2500)
      } catch (err: unknown) {
        setUploadStatus('error')
        setUploadMsg(err instanceof Error && err.message.includes('token')
          ? 'חסר GITHUB_TOKEN ב-Netlify'
          : 'שגיאה בהעלאה - בדוק שה-Token הוגדר ב-Netlify')
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSaveEdit(id: string) {
    const tags = editTagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    try {
      const res = await fetch('/api/update-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: editTitle, tags, category: editCategory }),
      })
      if (!res.ok) throw new Error()
      onProtocolsChange(protocols.map((p) => p.id === id ? { ...p, title: editTitle, tags, category: editCategory } : p))
      setEditingId(null)
    } catch { alert('שגיאה בשמירה') }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`למחוק את "${name}"?\nהפרוטוקול יוסר מהמאגר.`)) return
    try {
      const res = await fetch('/api/delete-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      onProtocolsChange(protocols.filter((p) => p.id !== id))
    } catch { alert('שגיאה במחיקה') }
  }

  async function handleAddCategory() {
    if (!newCatLabel.trim()) return
    const id = newCatLabel.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    if (categories.find((c) => c.id === id)) { setCatMsg('קטגוריה עם שם זה כבר קיימת'); return }
    const updated = [...categories, { id, label: newCatLabel.trim(), emoji: newCatEmoji }]
    try {
      const res = await fetch('/api/update-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updated }),
      })
      if (!res.ok) throw new Error(await res.text())
      onCategoriesChange(updated)
      setNewCatLabel(''); setNewCatEmoji('📁')
      setCatMsg('הקטגוריה נוספה!'); setTimeout(() => setCatMsg(''), 2000)
    } catch (err: unknown) {
      setCatMsg(err instanceof Error ? err.message : 'שגיאה - בדוק שה-Token הוגדר ב-Netlify')
    }
  }

  // ── Render ──

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
        <button onClick={onClose} className="p-2 rounded-full bg-gray-100 text-gray-500">
          <X size={18} />
        </button>
        <h2 className="font-bold text-lg text-gray-900">ניהול מאגר</h2>
        <div className="w-9" />
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 flex-shrink-0">
        {(['upload', 'categories'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400'
            }`}
          >
            {t === 'upload' ? 'הוספת פרוטוקול' : 'ניהול קטגוריות'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── UPLOAD TAB ── */}
        {tab === 'upload' && (
          <div className="p-4 space-y-4">

            {/* Existing protocols */}
            {protocols.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="font-semibold text-gray-700 text-sm">פרוטוקולים קיימים ({protocols.length})</p>
                </div>
                {protocols.map((p) => (
                  <div key={p.id} className="border-b border-gray-50 last:border-0">
                    {editingId === p.id ? (
                      <div className="p-4 space-y-3 bg-blue-50/50">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-medium outline-none focus:border-primary bg-white"
                        />
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary bg-white"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                          ))}
                        </select>
                        <input
                          value={editTagsRaw}
                          onChange={(e) => setEditTagsRaw(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary bg-white"
                          placeholder="מילות מפתח, מופרדות בפסיק"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveEdit(p.id)} className="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold text-sm">שמור</button>
                          <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-semibold text-sm">ביטול</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{p.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {categories.find((c) => c.id === p.category)?.emoji} {categories.find((c) => c.id === p.category)?.label}
                          </p>
                        </div>
                        <button
                          onClick={() => { setEditingId(p.id); setEditTitle(p.title); setEditCategory(p.category); setEditTagsRaw(p.tags.join(', ')) }}
                          className="p-2 bg-blue-50 text-blue-500 rounded-lg"
                        ><Edit2 size={15} /></button>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="p-2 bg-red-50 text-red-400 rounded-lg"
                        ><Trash2 size={15} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* New protocol form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
              <p className="font-bold text-gray-800">פרוטוקול חדש</p>

              {/* File upload - first */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  קובץ <span className="text-red-400">*</span>
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors ${
                    file ? 'border-primary bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-primary/50'
                  }`}
                >
                  <Upload size={26} className={`mx-auto mb-2 ${file ? 'text-primary' : 'text-gray-300'}`} />
                  {file ? (
                    <p className="font-semibold text-primary text-sm">{file.name}</p>
                  ) : (
                    <>
                      <p className="font-medium text-gray-500 text-sm">לחץ להעלאת קובץ</p>
                      <p className="text-xs text-gray-400 mt-0.5">תמונה, PDF, Word, PPT</p>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  שם הפרוטוקול <span className="text-red-400">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="לדוגמה: דריף קטמין-פנטניל"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-gray-800 placeholder:text-gray-300"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">קטגוריה</label>
                <div className="relative">
                  <select
                    value={selCategory}
                    onChange={(e) => setSelCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary bg-white text-gray-700 appearance-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">תיאור קצר</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="תיאור קצר של הפרוטוקול (לא חובה)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-gray-800 placeholder:text-gray-300"
                />
              </div>

              {/* Tags - the new interactive section */}
              <TagsSection
                suggested={suggestedTags}
                confirmed={confirmedTags}
                onAccept={acceptTag}
                onAcceptAll={acceptAllTags}
                onRemove={removeTag}
                onAddManual={addManualTag}
              />

              {/* Submit */}
              <button
                onClick={handleUpload}
                disabled={!file || !title || !selCategory || uploadStatus === 'uploading'}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
              >
                {uploadStatus === 'uploading' && <Loader size={18} className="animate-spin" />}
                {uploadStatus === 'done' && <CheckCircle size={18} />}
                {uploadStatus === 'error' && <AlertCircle size={18} />}
                {uploadStatus === 'idle' && <Upload size={18} />}
                {uploadStatus === 'uploading' ? 'מעלה...'
                  : uploadStatus === 'done' ? 'הועלה!'
                  : uploadStatus === 'error' ? 'שגיאה'
                  : `הוסף פרוטוקול${confirmedTags.length > 0 ? ` (${confirmedTags.length} תגיות)` : ''}`}
              </button>

              {uploadMsg && (
                <p className={`text-center text-sm font-medium rounded-xl py-2.5 px-3 ${
                  uploadStatus === 'done' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  {uploadMsg}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── CATEGORIES TAB ── */}
        {tab === 'categories' && (
          <div className="p-4 space-y-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {categories.map((cat, i) => (
                <div key={cat.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < categories.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="font-medium text-gray-800 flex-1">{cat.label}</span>
                  <button
                    onClick={async () => {
                      if (!window.confirm(`למחוק את הקטגוריה "${cat.label}"?\nפרוטוקולים בקטגוריה זו לא יימחקו.`)) return
                      const updated = categories.filter((c) => c.id !== cat.id)
                      try {
                        const res = await fetch('/api/update-categories', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ categories: updated }),
                        })
                        if (!res.ok) throw new Error()
                        onCategoriesChange(updated)
                      } catch { alert('שגיאה במחיקה') }
                    }}
                    className="p-2 bg-red-50 text-red-400 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
              <p className="font-bold text-gray-800">הוסף קטגוריה חדשה</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">אייקון</label>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-14 h-12 border-2 border-gray-200 rounded-xl text-2xl flex items-center justify-center hover:border-primary transition-colors"
                >
                  {newCatEmoji}
                </button>
                {showEmojiPicker && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {EMOJI_OPTIONS.map((em) => (
                        <button
                          key={em}
                          onClick={() => { setNewCatEmoji(em); setShowEmojiPicker(false) }}
                          className={`text-2xl p-1.5 rounded-lg transition-colors ${newCatEmoji === em ? 'bg-primary/10' : 'hover:bg-gray-200'}`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">שם קטגוריה</label>
                <input
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  placeholder="לדוגמה: נוזלים ועירויים"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary"
                />
              </div>

              <button
                onClick={handleAddCategory}
                disabled={!newCatLabel.trim()}
                className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold disabled:opacity-40"
              >
                הוסף קטגוריה
              </button>

              {catMsg && (
                <p className={`text-center text-sm font-medium rounded-xl py-2.5 px-3 ${
                  catMsg.includes('נוספה') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  {catMsg}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
