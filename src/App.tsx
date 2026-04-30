import { useState, useEffect, useMemo } from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import CategoryFilter from './components/CategoryFilter'
import ProtocolCard from './components/ProtocolCard'
import FileViewer from './components/FileViewer'
import AdminPanel from './components/AdminPanel'
import { useSearch } from './hooks/useSearch'
import { Protocol, Category } from './types'
import rawData from './data/protocols.json'
import { AlertCircle } from 'lucide-react'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex gap-1.5 mt-1">
          <div className="h-5 bg-gray-100 rounded-full w-14" />
          <div className="h-5 bg-gray-100 rounded-full w-10" />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [protocols, setProtocols] = useState<Protocol[]>(rawData.protocols as Protocol[])
  const [categories, setCategories] = useState<Category[]>(rawData.categories as Category[])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)
  const [showAdmin, setShowAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = useState(false)

  // Push history entry when modals open so back button closes them
  useEffect(() => {
    if (selectedProtocol) window.history.pushState({ modal: 'viewer' }, '')
  }, [selectedProtocol])

  useEffect(() => {
    if (showAdmin) window.history.pushState({ modal: 'admin' }, '')
  }, [showAdmin])

  useEffect(() => {
    const onPopState = () => {
      if (selectedProtocol) setSelectedProtocol(null)
      else if (showAdmin) setShowAdmin(false)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [selectedProtocol, showAdmin])

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/E2Je/nehmad-bamalrad/main/protocols.json')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.protocols) setProtocols(data.protocols)
        if (data?.categories) setCategories(data.categories)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const { results, ambiguous } = useSearch(protocols, query)

  const filtered = results.filter(
    (p) => activeCategory === 'all' || p.category === activeCategory
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: results.length }
    categories.forEach((cat) => {
      c[cat.id] = results.filter((p) => p.category === cat.id).length
    })
    return c
  }, [results, categories])

  const getCategoryById = (id: string) => categories.find((c) => c.id === id)

  return (
    <div className={`${dark ? 'dark' : ''} min-h-dvh flex flex-col bg-surface font-heb`}>
      {/* Sticky top bar: header + search + categories */}
      <div className="sticky top-0 z-10 flex flex-col">
        <Header
          onAdminClick={() => setShowAdmin(true)}
          dark={dark}
          onDarkToggle={() => setDark((d) => !d)}
        />
        <SearchBar value={query} onChange={setQuery} resultCount={filtered.length} />
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
          counts={counts}
          searchMode={!!query}
        />
      </div>

      {/* Ambiguous query hint */}
      {ambiguous && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2 fade-in">
          <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{ambiguous.question}</p>
        </div>
      )}

      {/* Protocol list */}
      <main className="flex-1 px-4 py-3 space-y-3 pb-8 safe-bottom">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 && query ? (
          <div className="text-center py-16 fade-in px-4">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-gray-700">לא נמצאו תוצאות עבור &quot;{query}&quot;</p>
            <p className="text-sm text-gray-400 mt-1">בדוק את האיות או נסה מילה אחרת</p>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-right">
              <p className="text-sm text-amber-800 font-medium">הפרוטוקול לא נמצא במאגר המאושר</p>
              <p className="text-xs text-amber-600 mt-1">יש לפעול לפי הנחיות המחלקה ולפנות לאחראית הדרכה לעדכון המערכת</p>
            </div>
          </div>
        ) : filtered.length === 0 && protocols.length === 0 ? (
          <div className="text-center py-16 fade-in px-4">
            <p className="text-5xl mb-4">📋</p>
            <p className="font-bold text-gray-700 text-lg">המאגר ריק</p>
            <p className="text-sm text-gray-400 mt-2">לחץ על מגן הניהול למעלה והוסף פרוטוקולים</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 fade-in">
            <p className="text-4xl mb-3">📂</p>
            <p className="text-gray-400">אין פרוטוקולים בקטגוריה זו עדיין</p>
          </div>
        ) : (
          filtered.map((p, i) => (
            <div key={p.id} className="fade-in" style={{ animationDelay: `${i * 45}ms` }}>
              <ProtocolCard
                protocol={p}
                category={getCategoryById(p.category)}
                onClick={() => setSelectedProtocol(p)}
                searchQuery={query}
                index={i}
              />
            </div>
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 px-4 safe-bottom">
        <p className="text-gray-400 text-xs">© נוצר על ידי איתמר גרינברג יחד עם ליאורה לוי</p>
      </footer>

      {selectedProtocol && (
        <FileViewer
          protocol={selectedProtocol}
          onClose={() => {
            setSelectedProtocol(null)
            if (window.history.state?.modal) window.history.back()
          }}
        />
      )}

      {showAdmin && (
        <AdminPanel
          protocols={protocols}
          categories={categories}
          onClose={() => {
            setShowAdmin(false)
            if (window.history.state?.modal) window.history.back()
          }}
          onProtocolsChange={setProtocols}
          onCategoriesChange={setCategories}
        />
      )}
    </div>
  )
}
