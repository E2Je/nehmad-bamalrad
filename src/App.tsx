import { useState, useEffect } from 'react'
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

export default function App() {
  const [protocols, setProtocols] = useState<Protocol[]>(rawData.protocols as Protocol[])
  const [categories, setCategories] = useState<Category[]>(rawData.categories as Category[])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)
  const [showAdmin, setShowAdmin] = useState(false)

  // Try to fetch live data from GitHub
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/E2Je/nehmad-bamalrad/main/protocols.json')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.protocols) setProtocols(data.protocols)
        if (data?.categories) setCategories(data.categories)
      })
      .catch(() => {}) // silently fall back to bundled data
  }, [])

  const { results, ambiguous } = useSearch(protocols, query)

  const filtered = results.filter(
    (p) => activeCategory === 'all' || p.category === activeCategory
  )

  const getCategoryById = (id: string) => categories.find((c) => c.id === id)

  return (
    <div className="min-h-dvh flex flex-col bg-surface font-heb">
      <Header onAdminClick={() => setShowAdmin(true)} />
      <SearchBar value={query} onChange={setQuery} resultCount={filtered.length} />
      <CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} />

      {/* Ambiguous query hint */}
      {ambiguous && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2 fade-in">
          <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{ambiguous.question}</p>
        </div>
      )}

      {/* Protocol list */}
      <main className="flex-1 px-4 py-3 space-y-3 pb-8 safe-bottom">
        {filtered.length === 0 && query ? (
          <div className="text-center py-16 fade-in">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-gray-700">לא נמצאו תוצאות</p>
            <p className="text-sm text-gray-400 mt-1">בדוק את האיות או נסה מילה אחרת</p>
            <p className="text-xs text-gray-300 mt-3 bg-gray-50 rounded-xl p-3 mx-4">
              הפרוטוקול לא נמצא במאגר המאושר.<br />
              יש לפנות לאחראית הדרכה לעדכון המערכת.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 fade-in">
            <p className="text-4xl mb-3">📂</p>
            <p className="text-gray-400">אין פרוטוקולים בקטגוריה זו עדיין</p>
          </div>
        ) : (
          filtered.map((p, i) => (
            <div key={p.id} className="fade-in" style={{ animationDelay: `${i * 40}ms` }}>
              <ProtocolCard
                protocol={p}
                category={getCategoryById(p.category)}
                onClick={() => setSelectedProtocol(p)}
                searchQuery={query}
              />
            </div>
          ))
        )}
      </main>

      {/* File viewer modal */}
      {selectedProtocol && (
        <FileViewer protocol={selectedProtocol} onClose={() => setSelectedProtocol(null)} />
      )}

      {/* Admin panel */}
      {showAdmin && (
        <AdminPanel
          protocols={protocols}
          categories={categories}
          onClose={() => setShowAdmin(false)}
          onProtocolsChange={setProtocols}
          onCategoriesChange={setCategories}
        />
      )}
    </div>
  )
}
