import { memo } from 'react'
import type { LearnerModel } from '../types'

interface Props {
  models: LearnerModel[]
}

const LearnerContent = memo(function LearnerContent({ models }: Props) {
  return (
    <div className="win-inset" style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
      {models.map(m => (
        <div key={m.name} className="win-card">
          <div className="win-model" />
          <div style={{ fontWeight: 700, fontSize: 11 }}>{m.name}</div>
          <div style={{ fontSize: 11, color: '#008080' }}>Status: {m.status}</div>
          <div style={{ fontSize: 11, color: '#595a5b' }}>{m.time}</div>
        </div>
      ))}
      <div className="win-dropzone">Drop Zone</div>
    </div>
  )
})

export default LearnerContent
