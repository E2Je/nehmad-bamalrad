import { ArrowRight, ZoomIn, ZoomOut, Download } from 'lucide-react'
import { useState } from 'react'
import { Protocol } from '../types'

const GITHUB_RAW = 'https://raw.githubusercontent.com/E2Je/nehmad-bamalrad/main'
const GDOCS_VIEWER = 'https://docs.google.com/viewer?embedded=true&url='

interface FileViewerProps {
  protocol: Protocol
  onClose: () => void
}

export default function FileViewer({ protocol, onClose }: FileViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const rawUrl = `${GITHUB_RAW}/${protocol.githubPath}`
  const encodedUrl = encodeURIComponent(rawUrl)

  const isImage = protocol.fileType === 'image'
  const isPdf = protocol.fileType === 'pdf'
  const isDoc = protocol.fileType === 'word' || protocol.fileType === 'ppt'
  const viewerUrl = (isPdf || isDoc) ? `${GDOCS_VIEWER}${encodedUrl}` : null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900 modal-slide-up">

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-700/60 flex-shrink-0">
        {/* Back button - prominent */}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors flex-shrink-0"
        >
          <ArrowRight size={16} />
          חזרה
        </button>

        {/* Title */}
        <h2 className="flex-1 text-white font-semibold text-sm text-center truncate">
          {protocol.title}
        </h2>

        {/* Right side actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isImage && (
            <>
              <button
                onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                className="p-2.5 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-white/60 text-xs font-mono w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}
                className="p-2.5 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ZoomIn size={16} />
              </button>
            </>
          )}
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="פתח בחלון חדש"
          >
            <Download size={16} />
          </a>
        </div>
      </div>

      {/* Viewer area */}
      <div className="flex-1 overflow-auto pinch-zoom-container bg-gray-900 relative">
        {isImage && (
          <div className="min-h-full flex items-start justify-center p-4">
            <img
              src={rawUrl}
              alt={protocol.title}
              className="rounded-xl shadow-2xl max-w-full transition-transform duration-200"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
              }}
              onError={(e) => {
                const el = e.target as HTMLImageElement
                el.style.display = 'none'
                el.insertAdjacentHTML('afterend', `
                  <div class="text-center text-gray-400 py-20 w-full">
                    <p class="text-5xl mb-4">🖼️</p>
                    <p class="text-lg font-semibold text-gray-300">הקובץ לא נמצא</p>
                    <p class="text-sm text-gray-500 mt-2">ייתכן שהקובץ טרם הועלה לגיטהאב</p>
                  </div>
                `)
              }}
            />
          </div>
        )}

        {(isPdf || isDoc) && viewerUrl && (
          <>
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-400">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-sm">טוען מסמך...</p>
              </div>
            )}
            <iframe
              src={viewerUrl}
              className="w-full h-full border-0"
              onLoad={() => setIframeLoaded(true)}
              title={protocol.title}
            />
          </>
        )}
      </div>

      {/* Source note + back button repeated at bottom */}
      <div className="bg-gray-800 px-4 py-3 flex-shrink-0 safe-bottom flex items-center justify-between gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <ArrowRight size={14} />
          חזרה לחיפוש
        </button>
        <p className="text-gray-500 text-xs text-center flex-1">
          מקור: פרוטוקול מחלקתי מאושר
        </p>
      </div>
    </div>
  )
}
