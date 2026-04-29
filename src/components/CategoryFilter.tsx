import { useRef, useLayoutEffect } from 'react'
import { Category } from '../types'

interface CategoryFilterProps {
  categories: Category[]
  active: string
  onChange: (id: string) => void
  counts: Record<string, number>
  searchMode?: boolean
}

export default function CategoryFilter({ categories, active, onChange, counts, searchMode }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const btnsRef = useRef<Record<string, HTMLButtonElement | null>>({})

  useLayoutEffect(() => {
    const btn = btnsRef.current[active]
    const scroll = scrollRef.current
    const pill = pillRef.current
    if (!btn || !scroll || !pill) return
    pill.style.left   = btn.offsetLeft + 'px'
    pill.style.top    = btn.offsetTop + 'px'
    pill.style.width  = btn.offsetWidth + 'px'
    pill.style.height = btn.offsetHeight + 'px'
  }, [active])

  const all = [{ id: 'all', label: 'הכל', emoji: '' }, ...categories]

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out bg-white border-b border-gray-100"
      style={{ maxHeight: searchMode ? 0 : 60, opacity: searchMode ? 0 : 1 }}
    >
      <div
        className="flex gap-1.5 overflow-x-auto px-4 py-2.5 relative"
        ref={scrollRef}
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Sliding pill background */}
        <div
          ref={pillRef}
          className="absolute rounded-full bg-primary transition-all duration-300 pointer-events-none z-0"
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
            boxShadow: '0 2px 8px rgba(26,63,122,0.35)',
          }}
        />

        {all.map((cat) => {
          const count = cat.id === 'all' ? (counts.all ?? 0) : (counts[cat.id] ?? 0)
          return (
            <button
              key={cat.id}
              ref={(el) => { btnsRef.current[cat.id] = el }}
              onClick={() => onChange(cat.id)}
              className={`flex-shrink-0 relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
                active === cat.id ? 'text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
              style={{ background: 'transparent', border: 'none' }}
            >
              {cat.emoji && <span>{cat.emoji}</span>}
              {cat.label}
              <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
                active === cat.id ? 'bg-white/25 text-white' : 'bg-black/5 text-gray-400'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
