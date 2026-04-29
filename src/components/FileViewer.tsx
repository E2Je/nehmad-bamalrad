import { ArrowRight, ZoomIn, ZoomOut, Download } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
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
  const viewerRef = useRef<HTMLDivElement>(null)
  const lastDistRef = useRef<number | null>(null)

  const rawUrl = `${GITHUB_RAW}/${protocol.githubPath}`
  const encodedUrl = encodeURIComponent(rawUrl)

  const isImage = protocol.fileType === 'image'
  const isPdf = protocol.fileType === 'pdf'
  const isDoc = protocol.fileType === 'word' || protocol.fileType === 'ppt'
  const viewerUrl = (isPdf || isDoc) ? `${GDOCS_VIEWER}${encodedUrl}` : null

  useEffect(() => {
    if (!isImage) return
    const el = viewerRef.current
    if (!el) return

    const getDist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) lastDistRef.current = getDist(e.touches)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || lastDistRef.current === null) return
      e.preventDefault()
      const dist = getDist(e.touches)
      const delta = dist / lastDistRef.current
      setZoom((z) => Math.min(4, Math.max(0.5, parseFloat((z * delta).toFixed(2)))))
      lastDistRef.current = dist
    }

    const onTouchEnd = () => { lastDistRef.current = null }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [isImage])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900 modal-slide-up">

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-700/60 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors flex-shrink-0"
        >
          <ArrowRight size={16} />
          חזרה
        </button>

        <h2 className="flex-1 text-white font-semibold text-sm text-center truncate">
          {protocol.title}
        </h2>

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
      <div
        ref={viewerRef}
        className="flex-1 overflow-auto bg-gray-900 relative"
        style={{ touchAction: isImage ? 'pan-x pan-y' : 'auto' }}
      >
        {isImage && (
          <div className="flex justify-center p-4" style={{ minHeight: '100%' }}>
            <img
              src={rawUrl}
              alt={protocol.title}
              draggable={false}
              className="rounded-xl shadow-2xl select-none"
              style={{
                width: `${zoom * 100}%`,
                maxWidth: 'none',
                transition: 'width 0.05s ease',
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

      {/* Bottom bar */}
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
