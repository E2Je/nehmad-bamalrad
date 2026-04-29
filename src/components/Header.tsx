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
    <header className="bg-primary text-white px-4 pt-4 pb-3 sticky top-0 z-10">
      <div
        className="flex items-center justify-between header-inner"
        style={{
          paddingTop: compact ? 7 : 10,
          paddingBottom: compact ? 7 : 10,
          transition: 'padding 0.3s ease',
        }}
      >
        {/* Logo + Title block */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="לוגו נחמד במלר״ד"
            className="w-12 h-12 rounded-2xl object-cover shadow-lg flex-shrink-0"
            style={{
              transform: compact ? 'scale(0.88)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
            onError={(e) => {
              const img = e.target as HTMLImageElement
              img.src = '/logo.svg'
              img.onerror = () => { img.style.display = 'none' }
            }}
          />
          <div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
              נחמד במלר&quot;ד
            </h1>
            <p className="text-blue-100 text-xs leading-snug mt-0.5">
              כל מה שרצית לדעת ולא העזת לשאול
            </p>
            <p className="text-blue-200 text-xs leading-snug">
              מלר&quot;ד הדסה עין כרם
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://notebooklm.google.com/notebook/6697a610-54f5-4bba-a725-ae6f9fab23c5?authuser=4"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
          >
            <ExternalLink size={13} />
            שאלות חופשיות
          </a>
          <button
            onClick={onDarkToggle}
            className="p-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl transition-colors"
            aria-label="dark mode"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={onAdminClick}
            className="p-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl transition-colors"
            aria-label="כניסת מנהל"
          >
            <Shield size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
