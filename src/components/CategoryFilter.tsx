import { Category } from '../types'

interface CategoryFilterProps {
  categories: Category[]
  active: string
  onChange: (id: string) => void
}

export default function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto tags-scroll px-4 py-3 bg-white border-b border-gray-100">
      <button
        onClick={() => onChange('all')}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          active === 'all'
            ? 'bg-primary text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        הכל
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            active === cat.id
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>{cat.emoji}</span>
          {cat.label}
        </button>
      ))}
    </div>
  )
}
