import { memo, useState, useCallback, useRef } from 'react'
import type { ApiTask } from '../types'

const API = '/api'
const VGY_KEY = import.meta.env.VITE_VGY_USERKEY || ''

interface Props {
  tasks: ApiTask[]
  token: string | null
  onAddTask: (task: ApiTask) => void
}

const TaskItem = memo(function TaskItem({ task }: { task: ApiTask }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="win-task-item">
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
            <div style={{ fontWeight: 700, fontSize: 11, color: '#000' }}>{task.title}</div>
            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: task.difficulty === 'Hard' ? '#000080' : '#008000' }}>
              Difficulty: {task.difficulty}
            </div>
            {task.description && (
              <div style={{ fontSize: 10, color: '#595a5b', marginTop: 2, lineHeight: '14px' }}>{task.description}</div>
            )}
          </div>
          <button className="win-button" onClick={() => setOpen(true)} style={{ marginTop: 8, alignSelf: 'flex-start', height: 24, padding: '0 8px' }}>
            Open Task
          </button>
        </div>
      </div>
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setOpen(false)}>
          <div className="win-window" style={{ width: 480, maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
            <div className="win-title-sm" style={{ marginBottom: 4 }}>
              <span>{task.title}</span>
              <button className="win-btn-sm" onClick={() => setOpen(false)}><span style={{ fontWeight: 700, fontSize: 8 }}>x</span></button>
            </div>
            <div style={{ padding: 8, overflowY: 'auto' }}>
              {task.main_image_url?.endsWith('.glb') ? (
                <model-viewer
                  src={task.main_image_url}
                  style={{ width: '100%', height: 240, background: '#e5e7eb', borderWidth: 2, borderStyle: 'solid', borderColor: '#808080 #ffffff #ffffff #808080', marginBottom: 8 }}
                  camera-controls auto-rotate shadow-intensity="1"
                  alt={task.title}
                />
              ) : null}
              <div style={{ fontSize: 11, marginBottom: 8 }}>{task.description}</div>
              <div style={{ fontSize: 10, color: '#595a5b' }}>
                Difficulty: {task.difficulty}
                {task.deadline ? ' | Deadline: ' + new Date(task.deadline).toLocaleDateString() : ''}
              </div>
              {task.images && task.images.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {task.images.map(img => (
                    <img key={img.id} src={img.image_url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', border: '1px solid #000' }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
})

function AddNewModal({ onClose, token, onCreated }: { onClose: () => void; token: string | null; onCreated: (t: ApiTask) => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [extraImages, setExtraImages] = useState<string[]>([])

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

  const handleMainImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadToVgy(file)
    if (url) setMainImage(url)
    else setError('Failed to upload main image')
  }, [uploadToVgy])

  const handleExtraImages = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const urls: string[] = []
    for (const f of files) {
      const url = await uploadToVgy(f)
      if (url) urls.push(url)
    }
    if (urls.length) setExtraImages(prev => [...prev, ...urls])
    else setError('Failed to upload some images')
  }, [uploadToVgy])

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
      const body: any = { title, difficulty, description, deadline: deadline ? new Date(deadline).toISOString() : null, mainImageUrl: mainImage }
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
            <div style={{ fontWeight: 700 }}>Main Reference Image</div>
            {mainImage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={mainImage} alt="" style={{ width: 64, height: 64, objectFit: 'cover', border: '1px solid #000' }} />
                <span style={{ color: '#008000', fontSize: 10 }}>Uploaded</span>
                <button className="win-button" style={{ height: 20, padding: '0 6px', fontSize: 10 }} onClick={() => setMainImage(null)}>Remove</button>
              </div>
            ) : (
              <div>
                <button className="win-button" style={{ height: 22, padding: '0 8px' }} onClick={() => mainFileRef.current?.click()}>Upload Image</button>
                <input ref={mainFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleMainImage} />
              </div>
            )}
          </div>

          <div className="win-inset" style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontWeight: 700 }}>Additional Photos</div>
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
            <button className="win-button" style={{ height: 22, padding: '0 8px', alignSelf: 'flex-start' }} onClick={() => extraFileRef.current?.click()}>Add Photos</button>
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

const TasksContent = memo(function TasksContent({ tasks, token, onAddTask }: Props) {
  const [menu, setMenu] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const toggle = useCallback((name: string) => setMenu(m => m === name ? null : name), [])

  const handleMenuAction = useCallback((action: string) => {
    setMenu(null)
    if (action === 'Add New') setShowAdd(true)
    else alert(action + ' - coming soon!')
  }, [])

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
      <div className="win-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#808080', fontSize: 11 }}>No tasks yet</div>
        ) : tasks.map(t => <TaskItem key={t.id} task={t} />)}
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
