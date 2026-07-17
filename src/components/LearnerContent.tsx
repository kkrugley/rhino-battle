import { memo, useCallback, useRef, useState } from 'react'
import type { ApiModel } from '../types'
import { upload } from '@vercel/blob/client'

const API = '/api'

interface Props {
  models: ApiModel[]
  token: string | null
  onModelAdded: (model: ApiModel) => void
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

const LearnerContent = memo(function LearnerContent({ models, token, onModelAdded }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const doUpload = useCallback(async (file: File) => {
    if (!token || uploading) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'glb'
      const pathname = `models/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: API + '/models/upload',
        headers: { Authorization: 'Bearer ' + token },
      })
      const filenameFromUrl = blob.pathname.split('/').pop() || file.name
      const res = await fetch(API + '/models/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ filename: filenameFromUrl, fileUrl: blob.url }),
      })
      if (!res.ok) throw new Error('Failed to save model record')
      const model: ApiModel = await res.json()
      onModelAdded(model)
    } catch (e) {
      console.error('Upload failed', e)
    } finally {
      setUploading(false)
    }
  }, [token, uploading, onModelAdded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.name.endsWith('.glb') || f.name.endsWith('.obj') || f.name.endsWith('.3dm') || f.name.endsWith('.stl')
    )
    if (files.length > 0) doUpload(files[0])
  }, [doUpload])

  const handleClick = useCallback(() => fileRef.current?.click(), [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) doUpload(files[0])
    if (fileRef.current) fileRef.current.value = ''
  }, [doUpload])

  const visible = models.slice(0, 3)
  const hidden = models.slice(3)

  return (
    <div className="win-inset" style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
      <div
        className="win-dropzone"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={uploading ? undefined : handleClick}
        style={{ cursor: uploading ? 'wait' : 'pointer', marginTop: 0 }}
      >
        {uploading ? 'Uploading...' : 'Drop Zone (click or drag .glb/.obj/.3dm/.stl)'}
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
