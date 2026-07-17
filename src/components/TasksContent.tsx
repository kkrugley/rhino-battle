import { memo, useState, useCallback, useRef } from 'react'
import type { ApiTask } from '../types'
import { upload } from '@vercel/blob/client'

const API = '/api'
const VGY_KEY = import.meta.env.VITE_VGY_USERKEY || ''

const DIFF_COLORS: Record<string, string> = {
  Easy: '#008000',
  Medium: '#808000',
  Hard: '#000080',
}

interface Props {
  tasks: ApiTask[]
  token: string | null
  completedTaskIds: Set<number>
  onAddTask: (task: ApiTask) => void
  onDeleteTask: (taskId: number) => void
  onReorderTasks: (tasks: ApiTask[]) => void
}

const TaskItem = memo(function TaskItem({
  task, token, editMode, completed, onMoveUp, onMoveDown, onDelete
}: {
  task: ApiTask
  token: string | null
  editMode: boolean
  completed: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<ApiTask | null>(null)

  const handleOpen = useCallback(async () => {
    setOpen(true)
    if (!token) return
    try {
      const res = await fetch(API + '/tasks/' + task.id, {
        headers: { Authorization: 'Bearer ' + token },
      })
      if (res.ok) setDetail(await res.json())
    } catch { /* use local data fallback */ }
  }, [task.id, token])

  return (
    <>
      <div className="win-task-item" style={editMode ? { alignItems: 'center' } : undefined}>
        {editMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
            <button className="win-btn-sm" onClick={onMoveUp} style={{ width: 18, height: 14, fontSize: 7, lineHeight: '6px' }}>&#9650;</button>
            <button className="win-btn-sm" onClick={onMoveDown} style={{ width: 18, height: 14, fontSize: 7, lineHeight: '6px' }}>&#9660;</button>
          </div>
        )}
        {task.main_image_url ? (
          task.main_image_url.endsWith('.glb') ? (
            <model-viewer
              src={task.main_image_url}
              style={{ width: 96, height: 96, objectFit: 'cover', border: '1px solid #000', flexShrink: 0, background: '#e5e7eb' }}
              camera-controls auto-rotate disable-zoom shadow-intensity="1"
              alt={task.title}
            />
          ) : (
            <img src={task.main_image_url} alt={task.title} loading="lazy" style={{ width: 96, height: 96, objectFit: 'cover', border: '1px solid #000', flexShrink: 0 }} />
          )
        ) : (
          <div style={{ width: 96, height: 96, border: '1px solid #000', flexShrink: 0, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#808080' }}>No Image</div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 11, color: '#000', display: 'flex', alignItems: 'center', gap: 4 }}>
              {task.title}
              {completed && <span style={{ color: '#008000', fontSize: 14 }}>&#10003;</span>}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: DIFF_COLORS[task.difficulty] || '#000' }}>
              Difficulty: {task.difficulty}
            </div>
            {task.description && (
              <div style={{ fontSize: 10, color: '#595a5b', marginTop: 2, lineHeight: '14px' }}>{task.description}</div>
            )}
          </div>
          {!editMode && (
            <button className="win-button" onClick={handleOpen} style={{ marginTop: 8, alignSelf: 'flex-start', height: 24, padding: '0 8px' }}>
              Open Task
            </button>
          )}
        </div>
        {editMode && (
          <button className="win-button" onClick={onDelete} style={{ flexShrink: 0, height: 22, padding: '0 6px', fontSize: 10, color: '#800000' }}>
            Delete
          </button>
        )}
      </div>
      {open && (() => {
        const data = detail || task
        return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setOpen(false)}>
          <div className="win-window" style={{ width: 480, maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
            <div className="win-title-sm" style={{ marginBottom: 4 }}>
              <span>{data.title}</span>
              <button className="win-btn-sm" onClick={() => setOpen(false)}><span style={{ fontWeight: 700, fontSize: 8 }}>x</span></button>
            </div>
            <div style={{ padding: 8, overflowY: 'auto' }}>
              {data.main_image_url?.endsWith('.glb') ? (
                <model-viewer
                  src={data.main_image_url}
                  style={{ width: '100%', height: 240, background: '#e5e7eb', borderWidth: 2, borderStyle: 'solid', borderColor: '#808080 #ffffff #ffffff #808080', marginBottom: 8 }}
                  camera-controls auto-rotate shadow-intensity="1"
                  alt={data.title}
                />
              ) : data.main_image_url ? (
                <img src={data.main_image_url} alt={data.title} style={{ width: '100%', maxHeight: 240, objectFit: 'contain', border: '1px solid #000', marginBottom: 8 }} />
              ) : null}
              <div style={{ fontSize: 11, marginBottom: 8 }}>{data.description}</div>
              <div style={{ fontSize: 10, color: '#595a5b' }}>
                Difficulty: {data.difficulty}
                {data.deadline ? ' | Deadline: ' + new Date(data.deadline).toLocaleDateString() : ''}
              </div>
              {data.images && data.images.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {data.images.map(img => (
                    <img key={img.id} src={img.image_url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', border: '1px solid #000' }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )})()}
    </>
  )
})

function AddNewModal({ onClose, token, onCreated }: { onClose: () => void; token: string | null; onCreated: (t: ApiTask) => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [mainIsModel, setMainIsModel] = useState(false)
  const [mainUploading, setMainUploading] = useState(false)
  const [extraImages, setExtraImages] = useState<string[]>([])
  const MAX_EXTRA = 5

  const titleRef = useRef<HTMLInputElement>(null)
  const diffRef = useRef<HTMLSelectElement>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)
  const deadlineRef = useRef<HTMLInputElement>(null)
  const mainFileRef = useRef<HTMLInputElement>(null)
  const extraFileRef = useRef<HTMLInputElement>(null)

  const uploadToVgy = useCallback(async (file: File): Promise<string | null> => {
    const fd = new FormData()
    fd.append('file', file)
    if (VGY_KEY) fd.append('userkey', VGY_KEY)
    try {
      const res = await fetch('https://vgy.me/upload', { method: 'POST', body: fd })
      const data = await res.json()
      return data.error ? null : data.image
    } catch { return null }
  }, [])

  const uploadToBlob = useCallback(async (file: File): Promise<string | null> => {
    if (!token) return null
    try {
      const ext = file.name.split('.').pop() || 'glb'
      const pathname = `task-models/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.glb`
      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: API + '/models/upload',
        headers: { Authorization: 'Bearer ' + token },
      })
      return blob.url
    } catch { return null }
  }, [token])

  const handleMainImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMainUploading(true)
    setError('')
    const isModel = file.name.endsWith('.glb') || file.name.endsWith('.obj') || file.name.endsWith('.3dm') || file.name.endsWith('.stl')
    const url = isModel ? await uploadToBlob(file) : await uploadToVgy(file)
    if (url) { setMainImage(url); setMainIsModel(isModel) }
    else setError('Failed to upload main ' + (isModel ? '3D model' : 'image'))
    setMainUploading(false)
    if (mainFileRef.current) mainFileRef.current.value = ''
  }, [uploadToVgy, uploadToBlob])

  const handleExtraImages = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const slots = MAX_EXTRA - extraImages.length
    if (slots <= 0) { setError('Max 5 additional images'); return }
    const toUpload = files.slice(0, slots)
    const urls: string[] = []
    for (const f of toUpload) {
      const url = await uploadToVgy(f)
      if (url) urls.push(url)
    }
    if (urls.length) setExtraImages(prev => [...prev, ...urls])
    else setError('Failed to upload some images')
  }, [extraImages.length, uploadToVgy])

  const handleSave = useCallback(async () => {
    const title = titleRef.current?.value.trim()
    const difficulty = diffRef.current?.value
    const description = descRef.current?.value.trim() || ''
    const deadline = deadlineRef.current?.value || null

    if (!title) { setError('Title is required'); return }
    if (!difficulty) { setError('Difficulty is required'); return }

    setSaving(true)
    setError('')

    try {
      const body: any = { title, difficulty, description, deadline: deadline ? new Date(deadline).toISOString() : null, mainImageUrl: mainImage, taskImages: extraImages }
      const res = await fetch(API + '/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({ error: 'Save failed' })); throw new Error(d.error || 'Save failed') }

      const task: ApiTask = await res.json()
      task.images = extraImages.map((url, i) => ({ id: -(i + 1), image_url: url }))
      onCreated(task)
      onClose()
    } catch (e: any) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [token, mainImage, extraImages, onCreated, onClose])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="win-window" style={{ width: 520, maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="win-title-sm" style={{ marginBottom: 4 }}>
          <span>Add New Task</span>
          <button className="win-btn-sm" onClick={onClose}><span style={{ fontWeight: 700, fontSize: 8 }}>x</span></button>
        </div>
        <div style={{ padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ width: 80, flexShrink: 0 }}>Title:</label>
            <input ref={titleRef} type="text" className="win-input" style={{ flex: 1 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ width: 80, flexShrink: 0 }}>Difficulty:</label>
            <select ref={diffRef} className="win-input" style={{ flex: 1, height: 22 }}>
              <option value="">Select...</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <label style={{ width: 80, flexShrink: 0 }}>Description:</label>
            <textarea ref={descRef} className="win-input" style={{ flex: 1, minHeight: 72, resize: 'vertical', fontFamily: 'Arimo, monospace' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ width: 80, flexShrink: 0 }}>Deadline:</label>
            <input ref={deadlineRef} type="date" className="win-input" style={{ flex: 1 }} />
          </div>

          <div className="win-inset" style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontWeight: 700 }}>Main Reference Image / 3D Model</div>
            {mainImage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {mainIsModel ? (
                  <model-viewer src={mainImage} style={{ width: 64, height: 64, background: '#e5e7eb', border: '1px solid #000' }} camera-controls auto-rotate disable-zoom shadow-intensity="1" alt="" />
                ) : (
                  <img src={mainImage} alt="" style={{ width: 64, height: 64, objectFit: 'cover', border: '1px solid #000' }} />
                )}
                <span style={{ color: '#008000', fontSize: 10 }}>Uploaded</span>
                <button className="win-button" style={{ height: 20, padding: '0 6px', fontSize: 10 }} onClick={() => { setMainImage(null); setMainIsModel(false) }}>Remove</button>
              </div>
            ) : (
              <div>
                <button className="win-button" style={{ height: 22, padding: '0 8px' }} onClick={() => mainFileRef.current?.click()} disabled={mainUploading}>
                  {mainUploading ? 'Uploading...' : 'Upload Image / .glb'}
                </button>
                <input ref={mainFileRef} type="file" accept="image/*,.glb,.obj,.3dm,.stl" style={{ display: 'none' }} onChange={handleMainImage} />
              </div>
            )}
          </div>

          <div className="win-inset" style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700 }}>Additional Photos</span>
              <span style={{ fontSize: 10, color: '#595a5b' }}>{extraImages.length}/{MAX_EXTRA}</span>
            </div>
            {extraImages.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {extraImages.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', border: '1px solid #000' }} />
                    <button className="win-btn-sm" style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, fontSize: 7 }}
                      onClick={() => setExtraImages(prev => prev.filter((_, j) => j !== i))}>X</button>
                  </div>
                ))}
              </div>
            )}
            <button className="win-button" style={{ height: 22, padding: '0 8px', alignSelf: 'flex-start' }}
              onClick={() => extraFileRef.current?.click()} disabled={extraImages.length >= MAX_EXTRA}>Add Photos</button>
            <input ref={extraFileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleExtraImages} />
          </div>

          {error && <div style={{ color: '#800000', fontSize: 10 }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            <button className="win-button win-button-default" onClick={handleSave} disabled={saving} style={{ padding: '4px 24px', height: 24 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="win-button" onClick={onClose} style={{ padding: '4px 16px', height: 24 }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const TasksContent = memo(function TasksContent({ tasks, token, completedTaskIds, onAddTask, onDeleteTask, onReorderTasks }: Props) {
  const [menu, setMenu] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  const toggle = useCallback((name: string) => setMenu(m => m === name ? null : name), [])

  const handleMenuAction = useCallback((action: string) => {
    setMenu(null)
    if (action === 'Add New') setShowAdd(true)
    else if (action === 'Edit List') setEditMode(e => !e)
    else alert(action + ' - coming soon!')
  }, [])

  const moveItem = useCallback((index: number, dir: -1 | 1) => {
    const next = [...tasks]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onReorderTasks(next)
    fetch(API + '/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ taskIds: next.map(t => t.id) }),
    }).catch(() => {})
  }, [tasks, token, onReorderTasks])

  const handleDelete = useCallback(async (taskId: number) => {
    setDeleting(taskId)
    try {
      await fetch(API + '/tasks/' + taskId, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      })
    } catch { /* ignore server error, remove locally anyway */ }
    onDeleteTask(taskId)
    setDeleting(null)
  }, [token, onDeleteTask])

  const items = menu === 'file' ? ['Add New', 'Open', 'Save', 'Exit'] : ['Edit List', 'Select All', 'Clear']

  return (
    <>
      <div className="win-menubar" style={{ position: 'relative' }}>
        <span className="win-menuitem" onClick={() => toggle('file')}>File</span>
        <span className="win-menuitem" onClick={() => toggle('edit')}>Edit</span>
        {menu && (
          <div className="win-dropdown" onMouseLeave={() => setMenu(null)}>
            {items.map(t => (
              <button key={t} className="win-dropdown-item" onClick={() => handleMenuAction(t)}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
      {editMode && (
        <div style={{ fontSize: 10, padding: '4px 8px', background: '#ffffcc', borderBottom: '1px solid #808080', color: '#000' }}>
          Edit mode — drag to reorder with ▲▼ buttons, click Delete to remove
        </div>
      )}
      <div className="win-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#808080', fontSize: 11 }}>No tasks yet</div>
        ) : tasks.map((t, i) => (
          <TaskItem key={t.id} task={t} token={token} editMode={editMode} completed={completedTaskIds.has(t.id)}
            onMoveUp={() => moveItem(i, -1)}
            onMoveDown={() => moveItem(i, 1)}
            onDelete={() => handleDelete(t.id)}
          />
        ))}
      </div>
      {showAdd && (
        <AddNewModal
          onClose={() => setShowAdd(false)}
          token={token}
          onCreated={onAddTask}
        />
      )}
    </>
  )
})

export default TasksContent
