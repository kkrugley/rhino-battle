import { memo } from 'react'
import type { LeaderEntry } from '../types'

interface Props {
  entries: LeaderEntry[]
}

const LeaderboardContent = memo(function LeaderboardContent({ entries }: Props) {
  return (
    <div className="win-card-inset" style={{ fontSize: 11, padding: 4 }}>
      {entries.map((e, i) => (
        <div key={e.name} className="win-lb-row" style={i === entries.length - 1 ? { borderBottom: 'none', marginBottom: 0, paddingBottom: 0 } : undefined}>
          <span style={i < 2 ? { fontWeight: 700 } : i === 2 ? { color: '#6b7280' } : undefined}>
            {i + 1}. {e.name}
          </span>
          <span>{e.score}</span>
        </div>
      ))}
    </div>
  )
})

export default LeaderboardContent
