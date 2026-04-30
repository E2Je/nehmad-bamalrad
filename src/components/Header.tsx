import { useState, useEffect } from 'react'
import { ExternalLink, Shield, Sun, Moon } from 'lucide-react'

interface HeaderProps {
  onAdminClick: () => void
  dark: boolean
  onDarkToggle: () => void
}

export default function Header({ onAdminClick, dark, onDarkToggle }: HeaderProps) {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="bg-primary text-white">
      <div
        className="flex items-center justify-between px-4"
        style={{
          paddingTop: compact ? 8 : 12,
          paddingBottom: compact ? 8 : 12,
          transition: 'padding 0.3s ease',
        }}
      >
        {/* Logo + Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img
            src="/logo.png"
            alt="לוגו"
            className="rounded-xl object-cover shadow-md flex-shrink-0"
            style={{
              width: compact ? 36 : 44,
              height: compact ? 36 : 44,
              transition: 'width 0.3s ease, height 0.3s ease',
            }}
            onError={(e) => {
              const img = e.target as HTMLImageElement
              img.src = '/logo.svg'
              img.onerror = () => { img.style.display = 'none' }
            }}
          />
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold leading-tight tracking-tight">
              נחמד במלר&quot;ד
            </h1>
            {!compact && (
              <p className="text-blue-200 text-[11px] leading-snug truncate">
                מלר&quot;ד הדסה עין כרם
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <a
            href="https://notebooklm.google.com/notebook/6697a610-54f5-4bba-a725-ae6f9fab23c5?authuser=4"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl px-2.5 py-2 transition-colors"
          >
            <ExternalLink size={14} />
            <span className="text-[11px] font-semibold">שאלות חופשיות</span>
          </a>
          <button
            onClick={onDarkToggle}
            className="p-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl transition-colors"
            aria-label="dark mode"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            onClick={onAdminClick}
            className="p-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl transition-colors"
            aria-label="כניסת מנהל"
          >
            <Shield size={17} />
          </button>
        </div>
      </div>
    </header>
  )
}
