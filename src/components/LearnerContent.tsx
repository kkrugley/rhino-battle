import { memo, useCallback, useRef, useState } from 'react'
import type { ApiModel, ApiTask } from '../types'
import { upload } from '@vercel/blob/client'
import ModelViewer from './ModelViewer'

const API = '/api'

interface Props {
  models: ApiModel[]
  tasks: ApiTask[]
  token: string | null
  onModelAdded: (model: ApiModel) => void
  showDropZone: boolean
}

const ModelCard = memo(function ModelCard({ model }: { model: ApiModel }) {
  return (
    <div className="win-card">
      {model.file_url ? (
        <ModelViewer src={model.file_url} style={{ width: '100%', height: 128 }} />
      ) : (
        <div className="win-model" />
      )}
      <div style={{ fontWeight: 700, fontSize: 11 }}>{model.filename}</div>
      {model.task_id ? (
        <div style={{ fontSize: 11, color: '#008000' }}>Task #{model.task_id}</div>
      ) : (
        <div style={{ fontSize: 11, color: '#808080' }}>No task</div>
      )}
      <div style={{ fontSize: 11, color: '#008080' }}>Status: {model.status}</div>
      <div style={{ fontSize: 11, color: '#595a5b' }}>{new Date(model.uploaded_at).toLocaleTimeString()}</div>
    </div>
  )
})

function AssignTaskModal({
  fileUrl, filename, tasks, token, onClose, onSaved,
}: {
  fileUrl: string
  filename: string
  tasks: ApiTask[]
  token: string
  onClose: () => void
  onSaved: (model: ApiModel) => void
}) {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = useCallback(async () => {
    if (!selectedTaskId) { setError('Please select a task'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(API + '/models/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ filename, fileUrl, taskId: selectedTaskId }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({ error: 'Save failed' })); throw new Error(d.error || 'Save failed') }
      const model: ApiModel = await res.json()
      onSaved(model)
    } catch (e: any) {
      setError(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [selectedTaskId, filename, fileUrl, token, onSaved])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="win-window" style={{ width: 420, maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="win-title-sm" style={{ marginBottom: 4 }}>
          <span>Assign Model to Task</span>
          <button className="win-btn-sm" onClick={onClose} disabled={saving}><span style={{ fontWeight: 700, fontSize: 8 }}>x</span></button>
        </div>
        <div style={{ padding: 8, overflowY: 'auto' }}>
          <ModelViewer src={fileUrl} style={{ width: '100%', height: 200, borderWidth: 2, borderStyle: 'solid', borderColor: '#808080 #ffffff #ffffff #808080', marginBottom: 8 }} />
          <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 6 }}>Select completed task:</div>
          {tasks.length === 0 ? (
            <div style={{ color: '#808080', fontSize: 11 }}>No tasks available</div>
          ) : (
            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
              {tasks.map(t => (
                <label key={t.id} className="win-task-select" style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '3px 4px',
                  background: selectedTaskId === t.id ? '#000080' : 'transparent',
                  color: selectedTaskId === t.id ? '#fff' : '#000',
                  cursor: 'pointer', fontSize: 11,
                }}>
                  <input type="radio" name="task" checked={selectedTaskId === t.id}
                    onChange={() => setSelectedTaskId(t.id)} style={{ accentColor: '#000080' }} />
                  <span>{t.title}</span>
                  <span style={{ color: selectedTaskId === t.id ? '#fff' : '#008000', fontSize: 10, marginLeft: 'auto' }}>{t.difficulty}</span>
                </label>
              ))}
            </div>
          )}
          {error && <div style={{ color: '#800000', fontSize: 10, marginBottom: 4 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button className="win-button win-button-default" onClick={handleSave} disabled={saving || !selectedTaskId} style={{ padding: '4px 24px', height: 24 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="win-button" onClick={onClose} disabled={saving} style={{ padding: '4px 16px', height: 24 }}>Skip</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const LearnerContent = memo(function LearnerContent({ models, tasks, token, onModelAdded, showDropZone }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [pendingModel, setPendingModel] = useState<{ fileUrl: string; filename: string } | null>(null)

  const doUpload = useCallback(async (file: File) => {
    if (!token || uploading) return
    setUploading(true)
    setUploadError('')
    try {
      const ext = file.name.split('.').pop() || 'glb'
      const pathname = `models/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: API + '/models/upload',
        headers: { Authorization: 'Bearer ' + token },
      })
      const filenameFromUrl = file.name  // preserve original name
      setPendingModel({ fileUrl: blob.url, filename: filenameFromUrl })
    } catch (e) {
      console.error('Upload failed', e)
      setUploadError('Upload failed. Check console for details.')
    } finally {
      setUploading(false)
    }
  }, [token, uploading])

  const handleSaved = useCallback((model: ApiModel) => {
    setPendingModel(null)
    onModelAdded(model)
  }, [onModelAdded])

  const handleSkip = useCallback(() => {
    setPendingModel(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.name.endsWith('.glb') || f.name.endsWith('.obj') || f.name.endsWith('.3dm') || f.name.endsWith('.stl')
    )
    if (files.length > 0) doUpload(files[0])
  }, [doUpload])

  const handleClick = useCallback(() => {
    setUploadError('')
    fileRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) doUpload(files[0])
    if (fileRef.current) fileRef.current.value = ''
  }, [doUpload])

  const visible = models.slice(0, 3)
  const hidden = models.slice(3)

  return (
    <div className="win-inset" style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
      {showDropZone && (
        <div className="win-dropzone" onDrop={handleDrop} onDragOver={e => e.preventDefault()}
          onClick={uploading ? undefined : handleClick}
          style={{ cursor: uploading ? 'wait' : 'pointer', marginTop: 0 }}>
          {uploading ? 'Uploading...' : 'Drop Zone (click or drag .glb/.obj/.3dm/.stl)'}
          <input ref={fileRef} type="file" accept=".glb,.obj,.3dm,.stl,.fbx" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      )}
      {uploadError && <div style={{ color: '#800000', fontSize: 10 }}>{uploadError}</div>}
      {visible.map(m => <ModelCard key={m.id} model={m} />)}
      {hidden.length > 0 && (
        <div style={{ maxHeight: 250, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hidden.map(m => <ModelCard key={m.id} model={m} />)}
        </div>
      )}
      {pendingModel && token && (
        <AssignTaskModal fileUrl={pendingModel.fileUrl} filename={pendingModel.filename}
          tasks={tasks} token={token}
          onClose={handleSkip} onSaved={handleSaved} />
      )}
    </div>
  )
})

export default LearnerContent
