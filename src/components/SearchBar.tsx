import { useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  resultCount: number
}

export default function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus on mount (desktop) without forcing keyboard on mobile
    if (window.innerWidth > 768) inputRef.current?.focus()
  }, [])

  return (
    <div className="bg-primary pb-4 px-4 pt-1">
      <div className="relative">
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="חפש פרוטוקול, תרופה, פרוצדורה..."
          className="w-full bg-white rounded-2xl py-3.5 pr-12 pl-10 text-base font-medium text-gray-800 placeholder:text-gray-400 shadow-lg outline-none focus:ring-2 focus:ring-primary-light transition-shadow"
          dir="rtl"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute inset-y-0 left-0 flex items-center pl-4"
          >
            <X size={18} className="text-gray-400" />
          </button>
        )}
      </div>

      {value && (
        <p className="text-blue-200 text-xs mt-2 text-center fade-in">
          {resultCount === 0
            ? 'לא נמצאו תוצאות'
            : `נמצאו ${resultCount} פרוטוקולים`}
        </p>
      )}
    </div>
  )
}
