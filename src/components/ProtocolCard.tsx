import { FileText, FileType, Presentation, Image } from 'lucide-react'
import { Protocol, Category } from '../types'

const GITHUB_RAW = 'https://raw.githubusercontent.com/E2Je/nehmad-bamalrad/main'

interface ProtocolCardProps {
  protocol: Protocol
  category?: Category
  onClick: () => void
  searchQuery: string
}

const FILE_PLACEHOLDER: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  pdf:  { icon: FileText,     bg: 'bg-red-50',    color: 'text-red-500' },
  word: { icon: FileType,     bg: 'bg-blue-50',   color: 'text-blue-500' },
  ppt:  { icon: Presentation, bg: 'bg-orange-50', color: 'text-orange-500' },
  image:{ icon: Image,        bg: 'bg-gray-100',  color: 'text-gray-400' },
}

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

export default function ProtocolCard({ protocol, category, onClick, searchQuery }: ProtocolCardProps) {
  const rawUrl = `${GITHUB_RAW}/${protocol.githubPath}`
  const placeholder = FILE_PLACEHOLDER[protocol.fileType] ?? FILE_PLACEHOLDER.image
  const PlaceholderIcon = placeholder.icon

  return (
    <button
      onClick={onClick}
      className="protocol-card w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-right flex items-stretch hover:shadow-md active:scale-95"
    >
      {/* Thumbnail */}
      <div className={`w-20 flex-shrink-0 relative overflow-hidden ${protocol.fileType === 'image' ? 'bg-gray-50' : placeholder.bg}`}>
        {protocol.fileType === 'image' ? (
          <img
            src={rawUrl}
            alt={protocol.title}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement
              img.style.display = 'none'
              const parent = img.parentElement!
              parent.classList.add(placeholder.bg)
              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="${placeholder.color}"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlaceholderIcon size={28} className={placeholder.color} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-3.5">
        <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2">
          {highlightText(protocol.title, searchQuery)}
        </h3>

        {category && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            {category.emoji} {category.label}
          </span>
        )}

        {/* Tags preview */}
        {protocol.tags.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {protocol.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                {tag}
              </span>
            ))}
            {protocol.tags.length > 3 && (
              <span className="text-xs text-gray-300">+{protocol.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div className="flex items-center pl-3 pr-1 text-gray-200">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </div>
    </button>
  )
}
