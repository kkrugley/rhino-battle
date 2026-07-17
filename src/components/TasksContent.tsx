import { memo, useState, useCallback } from 'react'
import type { Task } from '../types'

interface Props {
  tasks: Task[]
}

const TaskItem = memo(function TaskItem({ task }: { task: Task }) {
  return (
    <div className="win-task-item">
      <img
        src={task.thumb}
        alt={task.title}
        loading="lazy"
        style={{ width: 96, height: 96, objectFit: 'cover', border: '1px solid #000', flexShrink: 0 }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 11, color: '#000' }}>{task.title}</div>
          <div style={{
            fontSize: 11, fontWeight: 700, marginTop: 4,
            color: task.diff === 'Hard' ? '#000080' : '#008000',
          }}>
            Difficulty: {task.diff}
          </div>
        </div>
        <button className="win-button" style={{ marginTop: 8, alignSelf: 'flex-start', height: 24, padding: '0 8px' }}>
          Upload Ref
        </button>
      </div>
    </div>
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
                onClick={() => { alert(`${t} - coming soon!`); setMenu(null) }}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="win-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tasks.map(t => <TaskItem key={t.title} task={t} />)}
      </div>
    </>
  )
})

export default TasksContent
