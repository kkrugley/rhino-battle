import { memo, useCallback } from 'react'

interface Props {
  id: string
  icon: string
  title: string
  active: boolean
  small?: boolean
  inactive?: boolean
  onFocus: () => void
  onMinimize: () => void
  onMaximize: () => void
  onClose: () => void
  onMove: (x: number, y: number) => void
}

const TitleBar = memo(function TitleBar({
  id, icon, title, active, small, inactive, onFocus, onMinimize, onMaximize, onClose, onMove
}: Props) {

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const parent = (e.currentTarget as HTMLElement).parentElement
    if (!parent) return
    e.stopPropagation()
    onFocus()
    const rect = parent.getBoundingClientRect()
    const ox = e.clientX - rect.left
    const oy = e.clientY - rect.top
    const move = (ev: MouseEvent) => onMove(ev.clientX - ox, ev.clientY - oy)
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }, [onFocus, onMove])

  const cls = small
    ? (inactive ? 'win-title-sm-inactive' : 'win-title-sm')
    : (inactive ? 'win-title-inactive' : 'win-title')
  const btnCls = small ? 'win-btn-sm' : 'win-btn'

  return (
    <div className={cls} onMouseDown={handleMouseDown} onDoubleClick={onMaximize}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon && <span className="material-symbols-outlined" style={{ fontSize: small ? 12 : 14 }}>{icon}</span>}
        <span>{title}</span>
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        {!small && (
          <>
            <button className={btnCls} onMouseDown={e => { e.stopPropagation(); onMinimize() }}>_</button>
            <button className={btnCls} onMouseDown={e => { e.stopPropagation(); onMaximize() }}>□</button>
          </>
        )}
        <button className={btnCls} onMouseDown={e => { e.stopPropagation(); onClose() }}>X</button>
      </div>
    </div>
  )
})

export default TitleBar
