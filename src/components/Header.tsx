import { ExternalLink, Shield } from 'lucide-react'

interface HeaderProps {
  onAdminClick: () => void
}

export default function Header({ onAdminClick }: HeaderProps) {
  return (
    <header className="bg-primary text-white px-4 pt-safe">
      <div className="flex items-center justify-between py-3">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="לוגו"
            className="w-10 h-10 rounded-xl object-cover shadow"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div>
            <h1 className="text-xl font-bold leading-tight">נחמד במלר&quot;ד</h1>
            <p className="text-xs text-blue-200 leading-tight">מלר&quot;ד הדסה עין כרם</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href="https://notebooklm.google.com/notebook/6697a610-54f5-4bba-a725-ae6f9fab23c5?authuser=4"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
          >
            <ExternalLink size={13} />
            שאלות חופשיות
          </a>
          <button
            onClick={onAdminClick}
            className="p-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl transition-colors"
            aria-label="כניסת מנהל"
          >
            <Shield size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
