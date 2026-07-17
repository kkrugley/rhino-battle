import { memo, useCallback, useRef } from 'react'
import type { ApiModel } from '../types'

interface Props {
  models: ApiModel[]
}

const ModelCard = memo(function ModelCard({ model }: { model: ApiModel }) {
  return (
    <div className="win-card">
      {model.file_url ? (
        <model-viewer
          src={model.file_url}
          style={{ width: '100%', height: 128, background: '#e5e7eb', borderWidth: 2, borderStyle: 'solid', borderColor: '#808080 #ffffff #ffffff #808080' }}
          camera-controls
          auto-rotate
          disable-zoom
          shadow-intensity="1"
          alt={model.filename}
        />
      ) : (
        <div className="win-model" />
      )}
      <div style={{ fontWeight: 700, fontSize: 11 }}>{model.filename}</div>
      <div style={{ fontSize: 11, color: '#008080' }}>Status: {model.status}</div>
      <div style={{ fontSize: 11, color: '#595a5b' }}>{new Date(model.uploaded_at).toLocaleTimeString()}</div>
    </div>
  )
})

const LearnerContent = memo(function LearnerContent({ models }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const modelFiles = files.filter(f => f.name.endsWith('.obj') || f.name.endsWith('.3dm') || f.name.endsWith('.glb') || f.name.endsWith('.stl'))
    if (modelFiles.length > 0) {
      alert('Upload ' + modelFiles.map(f => f.name).join(', ') + ' - coming soon!')
    }
  }, [])

  const handleClick = useCallback(() => fileRef.current?.click(), [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      alert('Upload ' + files.map(f => f.name).join(', ') + ' - coming soon!')
    }
  }, [])

  const visible = models.slice(0, 3)
  const hidden = models.slice(3)

  return (
    <div className="win-inset" style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
      <div
        className="win-dropzone"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={handleClick}
        style={{ cursor: 'pointer', marginTop: 0 }}
      >
        Drop Zone (click or drag .glb/.obj/.3dm)
        <input ref={fileRef} type="file" accept=".glb,.obj,.3dm,.stl" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>
      {visible.map(m => <ModelCard key={m.id} model={m} />)}
      {hidden.length > 0 && (
        <div style={{ maxHeight: 250, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hidden.map(m => <ModelCard key={m.id} model={m} />)}
        </div>
      )}
    </div>
  )
})

export default LearnerContent
