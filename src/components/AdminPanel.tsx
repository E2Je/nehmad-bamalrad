import { useState, useRef } from 'react'
import { X, Upload, Tag, FolderOpen, CheckCircle, AlertCircle, Loader, Edit2, Trash2 } from 'lucide-react'
import { Protocol, Category, FileType } from '../types'

const ADMIN_CODES = ['06918', '35321']

interface AdminPanelProps {
  protocols: Protocol[]
  categories: Category[]
  onClose: () => void
  onProtocolsChange: (protocols: Protocol[]) => void
  onCategoriesChange: (categories: Category[]) => void
}

type Step = 'login' | 'menu' | 'upload' | 'edit' | 'categories'
type UploadStatus = 'idle' | 'analyzing' | 'uploading' | 'done' | 'error'

function detectFileType(file: File): FileType {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['ppt', 'pptx'].includes(ext)) return 'ppt'
  return 'image'
}

function suggestTags(filename: string, title: string): string[] {
  const combined = (filename + ' ' + title).toLowerCase()
  const suggestions: string[] = []
  const map: Record<string, string[]> = {
    'קטמין': ['קטמין', 'ketamine', 'הרדמה'],
    'ketamine': ['קטמין', 'ketamine', 'הרדמה'],
    'פנטניל': ['פנטניל', 'fentanyl', 'כאב'],
    'fentanyl': ['פנטניל', 'fentanyl', 'כאב'],
    'אינסולין': ['אינסולין', 'insulin', 'סוכר', 'סוכרת'],
    'insulin': ['אינסולין', 'insulin', 'סוכר'],
    'נתרן': ['נתרן', 'sodium', 'היפונתרמיה', 'NaCl'],
    'hypo': ['היפו', 'נמוך'],
    'אנטיביוטיקה': ['אנטיביוטיקה', 'antibiotics', 'IV'],
    'antibiotic': ['אנטיביוטיקה', 'antibiotics'],
    'דריף': ['דריף', 'drip', 'עירוי'],
    'drip': ['דריף', 'drip', 'עירוי'],
    'פרוטוקול': ['פרוטוקול', 'protocol'],
  }
  for (const [key, tags] of Object.entries(map)) {
    if (combined.includes(key)) suggestions.push(...tags)
  }
  return [...new Set(suggestions)]
}

export default function AdminPanel({ protocols, categories, onClose, onProtocolsChange, onCategoriesChange }: AdminPanelProps) {
  const [step, setStep] = useState<Step>('login')
  const [code, setCode] = useState('')
  const [loginError, setLoginError] = useState(false)

  // Upload state
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadMsg, setUploadMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [editCategory, setEditCategory] = useState('')
  const [editTagInput, setEditTagInput] = useState('')

  // Category state
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('')

  function handleLogin() {
    if (ADMIN_CODES.includes(code.trim())) {
      setStep('menu')
      setLoginError(false)
    } else {
      setLoginError(true)
      setCode('')
    }
  }

  function handleFileChange(f: File) {
    setFile(f)
    const autoTitle = f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    setTitle(autoTitle)
    const suggested = suggestTags(f.name, autoTitle)
    setTags(suggested)
    setUploadStatus('idle')
  }

  function addTag(input: string, setter: (t: string[]) => void, current: string[]) {
    const cleaned = input.trim()
    if (cleaned && !current.includes(cleaned)) setter([...current, cleaned])
  }

  async function handleUpload() {
    if (!file || !title || !selectedCategory) return
    setUploadStatus('uploading')
    setUploadMsg('מעלה קובץ לגיטהאב...')

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1]
        const fileType = detectFileType(file)
        const safeName = file.name.replace(/\s+/g, '-')

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: safeName,
            content: base64,
            title,
            category: selectedCategory,
            tags,
            fileType,
          }),
        })

        if (!res.ok) throw new Error(await res.text())

        setUploadStatus('done')
        setUploadMsg('הקובץ הועלה בהצלחה!')

        // Refresh protocols from server
        const dataRes = await fetch('/api/protocols')
        if (dataRes.ok) onProtocolsChange(await dataRes.json())

        setTimeout(() => {
          setFile(null); setTitle(''); setTags([]); setSelectedCategory(''); setUploadStatus('idle')
        }, 2500)
      } catch (err) {
        setUploadStatus('error')
        setUploadMsg('שגיאה בהעלאה. נסה שוב.')
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSaveEdit(id: string) {
    try {
      const res = await fetch('/api/update-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: editTitle, tags: editTags, category: editCategory }),
      })
      if (!res.ok) throw new Error()
      const updated = protocols.map((p) =>
        p.id === id ? { ...p, title: editTitle, tags: editTags, category: editCategory } : p
      )
      onProtocolsChange(updated)
      setEditingId(null)
    } catch {
      alert('שגיאה בשמירה')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק את הפרוטוקול?')) return
    try {
      const res = await fetch('/api/delete-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      onProtocolsChange(protocols.filter((p) => p.id !== id))
    } catch {
      alert('שגיאה במחיקה')
    }
  }

  async function handleAddCategory() {
    if (!newCatLabel) return
    const id = newCatLabel.trim().toLowerCase().replace(/\s+/g, '-')
    const emoji = newCatEmoji || '📁'
    const newCat: Category = { id, label: newCatLabel.trim(), emoji }
    try {
      const res = await fetch('/api/update-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: [...categories, newCat] }),
      })
      if (!res.ok) throw new Error()
      onCategoriesChange([...categories, newCat])
      setNewCatLabel(''); setNewCatEmoji('')
    } catch {
      alert('שגיאה בשמירה')
    }
  }

  // ---- Render ----

  if (step === 'login') return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6 modal-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">כניסת מנהל</h2>
          <button onClick={onClose}><X size={22} className="text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">הכנס קוד גישה</p>
        <input
          type="password"
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="קוד גישה"
          className={`w-full border-2 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest outline-none transition-colors ${loginError ? 'border-red-400' : 'border-gray-200 focus:border-primary'}`}
          autoFocus
        />
        {loginError && <p className="text-red-500 text-sm text-center mt-2">קוד שגוי</p>}
        <button
          onClick={handleLogin}
          className="w-full mt-4 bg-primary text-white py-3 rounded-xl font-semibold text-lg hover:bg-primary-dark transition-colors"
        >
          כניסה
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-4 flex items-center justify-between flex-shrink-0">
        <button onClick={step === 'menu' ? onClose : () => setStep('menu')} className="flex items-center gap-2 text-white/80">
          {step === 'menu' ? <X size={20} /> : (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
          {step === 'menu' ? 'סגור' : 'חזרה'}
        </button>
        <h2 className="font-bold text-lg">
          {step === 'menu' ? 'ניהול מערכת' : step === 'upload' ? 'העלאת קובץ' : step === 'edit' ? 'עריכת פרוטוקולים' : 'ניהול קטגוריות'}
        </h2>
        <div className="w-16" />
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* MENU */}
        {step === 'menu' && (
          <div className="p-4 grid gap-3">
            {[
              { id: 'upload', icon: Upload, label: 'העלאת קובץ חדש', desc: 'הוסף פרוטוקול, תמונה או מסמך', color: 'bg-blue-50 text-blue-600' },
              { id: 'edit', icon: Edit2, label: 'עריכת פרוטוקולים', desc: 'ערוך כותרות, תגיות וקטגוריות', color: 'bg-green-50 text-green-600' },
              { id: 'categories', icon: FolderOpen, label: 'ניהול קטגוריות', desc: 'הוסף או ערוך קטגוריות', color: 'bg-purple-50 text-purple-600' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setStep(item.id as Step)}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 text-right hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon size={22} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* UPLOAD */}
        {step === 'upload' && (
          <div className="p-4 space-y-4">
            {/* File picker */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-white cursor-pointer hover:border-primary transition-colors"
            >
              <Upload size={32} className="text-gray-300 mx-auto mb-2" />
              {file ? (
                <p className="font-medium text-primary">{file.name}</p>
              ) : (
                <>
                  <p className="font-medium text-gray-600">בחר קובץ</p>
                  <p className="text-xs text-gray-400 mt-1">תמונה, PDF, Word, PPT</p>
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

            {file && (
              <>
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary"
                    placeholder="שם הפרוטוקול"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                          selectedCategory === cat.id
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 bg-white text-gray-600'
                        }`}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Tag size={14} className="inline ml-1" />
                    תגיות חיפוש (מוצע אוטומטית)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                        <button onClick={() => setTags(tags.filter((t) => t !== tag))}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault()
                          addTag(tagInput, setTags, tags)
                          setTagInput('')
                        }
                      }}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                      placeholder="הוסף תגית..."
                    />
                    <button
                      onClick={() => { addTag(tagInput, setTags, tags); setTagInput('') }}
                      className="bg-primary text-white px-4 rounded-xl text-sm font-medium"
                    >
                      הוסף
                    </button>
                  </div>
                </div>

                {/* Upload button */}
                <button
                  onClick={handleUpload}
                  disabled={!title || !selectedCategory || uploadStatus === 'uploading'}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
                >
                  {uploadStatus === 'uploading' && <Loader size={20} className="animate-spin" />}
                  {uploadStatus === 'done' && <CheckCircle size={20} />}
                  {uploadStatus === 'error' && <AlertCircle size={20} />}
                  {uploadStatus === 'idle' && <Upload size={20} />}
                  {uploadStatus === 'uploading' ? 'מעלה...' : uploadStatus === 'done' ? 'הועלה!' : uploadStatus === 'error' ? 'שגיאה' : 'העלה קובץ'}
                </button>

                {uploadMsg && (
                  <p className={`text-center text-sm font-medium ${uploadStatus === 'done' ? 'text-green-600' : 'text-red-500'}`}>
                    {uploadMsg}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* EDIT */}
        {step === 'edit' && (
          <div className="p-4 space-y-3">
            {protocols.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                {editingId === p.id ? (
                  <div className="space-y-3">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 font-semibold outline-none focus:border-primary"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setEditCategory(cat.id)}
                          className={`py-2 px-3 rounded-xl text-xs font-medium border-2 transition-all ${
                            editCategory === cat.id ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {cat.emoji} {cat.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {editTags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                          {tag}
                          <button onClick={() => setEditTags(editTags.filter((t) => t !== tag))}><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={editTagInput}
                        onChange={(e) => setEditTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addTag(editTagInput, setEditTags, editTags)
                            setEditTagInput('')
                          }
                        }}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                        placeholder="הוסף תגית..."
                      />
                      <button onClick={() => { addTag(editTagInput, setEditTags, editTags); setEditTagInput('') }} className="bg-primary text-white px-3 rounded-xl text-sm">+</button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(p.id)} className="flex-1 bg-primary text-white py-2.5 rounded-xl font-medium">שמור</button>
                      <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-medium">ביטול</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{categories.find((c) => c.id === p.category)?.label}</p>
                    </div>
                    <button
                      onClick={() => { setEditingId(p.id); setEditTitle(p.title); setEditTags(p.tags); setEditCategory(p.category) }}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CATEGORIES */}
        {step === 'categories' && (
          <div className="p-4 space-y-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
                <span className="text-2xl">{cat.emoji}</span>
                <span className="font-medium text-gray-800">{cat.label}</span>
              </div>
            ))}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
              <p className="font-semibold text-gray-700">הוסף קטגוריה חדשה</p>
              <div className="flex gap-2">
                <input
                  value={newCatEmoji}
                  onChange={(e) => setNewCatEmoji(e.target.value)}
                  className="w-16 border border-gray-200 rounded-xl px-3 py-2 text-center text-xl outline-none focus:border-primary"
                  placeholder="📁"
                  maxLength={2}
                />
                <input
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary"
                  placeholder="שם קטגוריה"
                />
              </div>
              <button
                onClick={handleAddCategory}
                disabled={!newCatLabel}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                הוסף קטגוריה
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
