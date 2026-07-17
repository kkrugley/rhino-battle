import { memo, useState, useCallback } from 'react'
import type { ApiTask } from '../types'

interface Props {
  tasks: ApiTask[]
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
              camera-controls
              auto-rotate
              disable-zoom
              shadow-intensity="1"
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
                  camera-controls
                  auto-rotate
                  shadow-intensity="1"
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

const TasksContent = memo(function TasksContent({ tasks }: Props) {
  const [menu, setMenu] = useState<string | null>(null)

  const toggle = useCallback((name: string) => {
    setMenu(m => m === name ? null : name)
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
              <button key={t} className="win-dropdown-item"
                onClick={() => { alert(t + ' - coming soon!'); setMenu(null) }}>
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
    </>
  )
})

export default TasksContent
