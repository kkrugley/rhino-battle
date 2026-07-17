import { memo, type ReactNode } from 'react'
import TitleBar from './TitleBar'

interface Props {
  id: string
  icon: string
  title: string
  x: number | null
  y: number | null
  right: number | null
  bottom: number | null
  width: number | string
  height: number | string
  z: number
  active: boolean
  minimized: boolean
  children: ReactNode
  small?: boolean
  inactiveTitle?: boolean
  onFocus: () => void
  onMinimize: () => void
  onMaximize: () => void
  onClose: () => void
  onMove: (x: number, y: number) => void
}

const Window = memo(function Window({
  id, icon, title, x, y, right, bottom, width, height, z, active, minimized, children,
  small, inactiveTitle, onFocus, onMinimize, onMaximize, onClose, onMove,
}: Props) {
  if (minimized) return null

  return (
    <div
      className="win-window"
      style={{
        position: 'absolute',
        left: x != null ? x : undefined,
        top: y != null ? y : undefined,
        right: right != null ? right : undefined,
        bottom: bottom != null ? bottom : undefined,
        width: typeof width === 'number' ? width : width,
        height: typeof height === 'number' ? (height || 'auto') : height,
        zIndex: z,
        ...(!small ? { minHeight: 100 } : {}),
      }}
      onMouseDown={onFocus}
    >
      <TitleBar
        id={id} icon={icon} title={title}
        active={active} small={small} inactive={inactiveTitle}
        onFocus={onFocus}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
        onMove={onMove}
      />
      {children}
    </div>
  )
})

export default Window
