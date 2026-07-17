import { memo, useState, useCallback, useRef, useEffect } from 'react'
import type { WindowState } from '../types'

interface Props {
  windows: Record<string, WindowState>
  activeWindow: string | null
  onFocus: (id: string) => void
  onRestore: (id: string) => void
  onLogout: () => void
}

const labels: Record<string, { icon: string; label: string }> = {
  tasks: { icon: 'terminal', label: 'Tasks.exe' },
  learner1: { icon: 'window', label: 'Learner_01.exe' },
  learner2: { icon: 'window', label: 'Learner_02.exe' },
  profile: { icon: 'person', label: 'User_Profile.exe' },
  leaderboard: { icon: 'leaderboard', label: 'Leaderboard.exe' },
  score: { icon: 'timer', label: 'Match_Score.exe' },
}

const order = ['tasks', 'learner1', 'learner2', 'profile', 'leaderboard', 'score']

const Taskbar = memo(function Taskbar({ windows, activeWindow, onFocus, onRestore, onLogout }: Props) {
  const [startOpen, setStartOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!startOpen) return
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setStartOpen(false)
      }
    }
    setTimeout(() => document.addEventListener('click', handle), 0)
    return () => document.removeEventListener('click', handle)
  }, [startOpen])

  const handleBtn = useCallback((id: string) => {
    if (windows[id]?.minimized) onRestore(id)
    else onFocus(id)
  }, [windows, onFocus, onRestore])

  return (
    <footer className="win-taskbar" ref={menuRef}>
      <button className="win-start" onMouseDown={e => e.preventDefault()} onClick={() => setStartOpen(o => !o)}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#000080', fontVariationSettings: "'FILL' 1" }}>grid_view</span>
        <span style={{ letterSpacing: '0.5px', fontWeight: 700 }}>Start</span>
      </button>

      {startOpen && (
        <div className="win-start-menu" style={{ zIndex: 200 }}>
          <button className="win-start-item" onClick={() => { alert('Programs - coming soon!'); setStartOpen(false) }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>folder</span>Programs
          </button>
          <button className="win-start-item" onClick={() => { alert('Documents - coming soon!'); setStartOpen(false) }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>description</span>Documents
          </button>
          <button className="win-start-item" onClick={() => { alert('Settings - coming soon!'); setStartOpen(false) }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>settings</span>Settings
          </button>
          <div className="win-start-sep" />
          <button className="win-start-item" onClick={() => { onLogout(); setStartOpen(false) }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>Log Out Admin
          </button>
        </div>
      )}

      <div className="win-sep" />

      {order.map(id => {
        const info = labels[id]
        if (!info) return null
        const isActive = activeWindow === id
        const isMin = windows[id]?.minimized
        const cls = isActive || isMin ? 'win-task-btn-pressed' : 'win-task-btn'
        return (
          <button key={id} className={cls} onClick={() => handleBtn(id)}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{info.icon}</span>
            <span>{info.label}</span>
          </button>
        )
      })}

      <div style={{ flex: 1 }} />
    </footer>
  )
})

export default Taskbar
