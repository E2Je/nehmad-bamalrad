import { FileText, Image, FileType, Presentation } from 'lucide-react'
import { Protocol, Category } from '../types'

interface ProtocolCardProps {
  protocol: Protocol
  category?: Category
  onClick: () => void
  searchQuery: string
}

const FILE_ICONS = {
  image: Image,
  pdf: FileText,
  word: FileType,
  ppt: Presentation,
}

const FILE_COLORS = {
  image: 'bg-green-100 text-green-700',
  pdf: 'bg-red-100 text-red-700',
  word: 'bg-blue-100 text-blue-700',
  ppt: 'bg-orange-100 text-orange-700',
}

const FILE_LABELS = {
  image: 'תמונה',
  pdf: 'PDF',
  word: 'Word',
  ppt: 'PPT',
}

function highlightText(text: string, query: string) {
  if (!query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
      : part
  )
}

export default function ProtocolCard({ protocol, category, onClick, searchQuery }: ProtocolCardProps) {
  const Icon = FILE_ICONS[protocol.fileType]

  return (
    <button
      onClick={onClick}
      className="protocol-card w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-right flex items-start gap-3 hover:shadow-md active:scale-95"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${FILE_COLORS[protocol.fileType]}`}>
        <Icon size={22} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-base leading-snug truncate">
          {highlightText(protocol.title, searchQuery)}
        </h3>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {category && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {category.emoji} {category.label}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FILE_COLORS[protocol.fileType]}`}>
            {FILE_LABELS[protocol.fileType]}
          </span>
        </div>

        {/* Tags preview */}
        <div className="flex gap-1.5 mt-2 overflow-hidden">
          {protocol.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full whitespace-nowrap">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0 text-gray-300 mt-1">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </div>
    </button>
  )
}
