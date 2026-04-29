import { FileText, FileType, Presentation, Image } from 'lucide-react'
import { Protocol, Category } from '../types'

interface ProtocolCardProps {
  protocol: Protocol
  category?: Category
  onClick: () => void
  searchQuery: string
  index?: number
}

const CAT_COLORS: Record<string, { border: string; bg: string; color: string }> = {
  drips:       { border: '#0891b2', bg: 'rgba(8,145,178,0.1)',   color: '#0891b2' },
  medications: { border: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  color: '#7c3aed' },
  antibiotics: { border: '#059669', bg: 'rgba(5,150,105,0.1)',   color: '#059669' },
  protocols:   { border: '#2563eb', bg: 'rgba(37,99,235,0.1)',   color: '#2563eb' },
  procedures:  { border: '#d97706', bg: 'rgba(217,119,6,0.1)',   color: '#d97706' },
  other:       { border: '#64748b', bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
}

const FILE_ICON: Record<string, React.ElementType> = {
  pdf:   FileText,
  word:  FileType,
  ppt:   Presentation,
  image: Image,
}

const MAX_TAGS = 3

function highlightText(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5 not-italic">{part}</mark>
      : part
  )
}

export default function ProtocolCard({ protocol, category, onClick, searchQuery, index = 0 }: ProtocolCardProps) {
  const catColor = CAT_COLORS[protocol.category] ?? CAT_COLORS.other
  const Icon = FILE_ICON[protocol.fileType] ?? FileText
  const extraTags = protocol.tags.length - MAX_TAGS

  return (
    <button
      className="protocol-card w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-right flex items-start gap-3 hover:shadow-md active:scale-95"
      style={{
        borderRight: `3.5px solid ${catColor.border}`,
        animationDelay: `${index * 45}ms`,
      }}
      onClick={onClick}
    >
      {/* Category-colored file icon */}
      <div
        style={{ background: catColor.bg }}
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
      >
        <Icon size={22} style={{ color: catColor.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2">
          {highlightText(protocol.title, searchQuery)}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {category && (
            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {category.emoji} {category.label}
            </span>
          )}
          <span className="text-xs bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">
            {new Date(protocol.updatedAt).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: '2-digit' })}
          </span>
        </div>

        {protocol.tags.length > 0 && (
          <div className="flex gap-1.5 mt-2 overflow-hidden">
            {protocol.tags.slice(0, MAX_TAGS).map((tag) => (
              <span key={tag} className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                {tag}
              </span>
            ))}
            {extraTags > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                +{extraTags}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div className="flex items-center self-center text-gray-200">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </div>
    </button>
  )
}
