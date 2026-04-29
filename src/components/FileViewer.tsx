import { X, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react'
import { useState, useRef } from 'react'
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
  const imgRef = useRef<HTMLImageElement>(null)

  const rawUrl = `${GITHUB_RAW}/${protocol.githubPath}`
  const encodedUrl = encodeURIComponent(rawUrl)

  const isImage = protocol.fileType === 'image'
  const isPdf = protocol.fileType === 'pdf'
  const isDoc = protocol.fileType === 'word' || protocol.fileType === 'ppt'

  const viewerUrl = isPdf
    ? `${GDOCS_VIEWER}${encodedUrl}`
    : isDoc
    ? `${GDOCS_VIEWER}${encodedUrl}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <X size={16} />
          סגור
        </button>

        <h2 className="text-white font-semibold text-sm truncate mx-3 flex-1 text-center">
          {protocol.title}
        </h2>

        {isImage && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-2 text-white bg-white/10 rounded-lg"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-2 py-1.5 text-white bg-white/10 rounded-lg text-xs font-mono min-w-[44px] text-center"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
              className="p-2 text-white bg-white/10 rounded-lg"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        )}

        {!isImage && (
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-white bg-white/10 rounded-xl"
          >
            <Download size={16} />
          </a>
        )}
      </div>

      {/* Viewer area */}
      <div className="flex-1 overflow-auto pinch-zoom-container relative">
        {isImage && (
          <div className="min-h-full flex items-start justify-center p-4">
            <img
              ref={imgRef}
              src={rawUrl}
              alt={protocol.title}
              className="rounded-lg shadow-2xl max-w-none"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}
              onError={(e) => {
                const el = e.target as HTMLImageElement
                el.style.display = 'none'
                el.parentElement!.innerHTML = `
                  <div class="text-center text-gray-400 py-16">
                    <p class="text-lg font-medium">הקובץ לא נמצא</p>
                    <p class="text-sm mt-2">יש לוודא שהקובץ הועלה לגיטהאב</p>
                  </div>`
              }}
            />
          </div>
        )}

        {(isPdf || isDoc) && viewerUrl && (
          <>
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-4">
                <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin border-2" />
                <p className="text-sm">טוען מסמך...</p>
              </div>
            )}
            <iframe
              src={viewerUrl}
              className="w-full h-full border-0"
              onLoad={() => setIframeLoaded(true)}
              title={protocol.title}
              allow="fullscreen"
            />
          </>
        )}
      </div>

      {/* Source note */}
      <div className="bg-gray-800 px-4 py-2 flex-shrink-0 safe-bottom">
        <p className="text-center text-gray-400 text-xs">
          מקור: פרוטוקול מחלקתי מאושר - באחריות אחראית הדרכה
        </p>
      </div>
    </div>
  )
}
