import { memo, useCallback, useEffect, useRef } from 'react'
import type { AppState, AppAction, ApiTask, ApiModel } from '../types'
import LoginModal from './LoginModal'
import Taskbar from './Taskbar'
import Window from './Window'
import LearnerContent from './LearnerContent'
import TasksContent from './TasksContent'
import ScoreContent from './ScoreContent'
import ProfileContent from './ProfileContent'

const API = '/api'

interface Props {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const Desktop = memo(function Desktop({ state, dispatch }: Props) {
  const loadingRef = useRef(false)

  const loadData = useCallback(async () => {
    if (!state.authenticated || !state.token || loadingRef.current) return
    loadingRef.current = true

    try {
      const headers = { Authorization: 'Bearer ' + state.token }

      const [tasksRes, m1, m2, scoreRes, usersRes] = await Promise.all([
        fetch(API + '/tasks', { headers }),
        fetch(API + '/models/1', { headers }),
        fetch(API + '/models/2', { headers }),
        fetch(API + '/score', { headers }),
        fetch(API + '/users', { headers }),
      ])

      const [tasks, models1, models2, score, users] = await Promise.all([
        tasksRes.json(), m1.json(), m2.json(), scoreRes.json(), usersRes.json(),
      ])

      dispatch({
        type: 'SET_DATA',
        tasks,
        models: { learner1: models1, learner2: models2 },
        score,
      })
      dispatch({ type: 'SET_USERS', users })
    } catch (e) {
      console.error('Failed to load data', e)
    } finally {
      loadingRef.current = false
    }
  }, [state.authenticated, state.token, dispatch])

  useEffect(() => {
    if (state.authenticated && !state.dataLoaded) loadData()
  }, [state.authenticated, state.dataLoaded, loadData])

  const focus = useCallback((id: string) => dispatch({ type: 'FOCUS_WINDOW', id }), [dispatch])
  const min = useCallback((id: string) => dispatch({ type: 'MINIMIZE', id }), [dispatch])
  const max = useCallback((id: string) => dispatch({ type: 'MAXIMIZE', id }), [dispatch])
  const close = useCallback((id: string) => dispatch({ type: 'CLOSE', id }), [dispatch])
  const move = useCallback((id: string, x: number, y: number) => dispatch({ type: 'MOVE', id, x, y }), [dispatch])
  const restore = useCallback((id: string) => dispatch({ type: 'RESTORE', id }), [dispatch])
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }, [dispatch])

  const onModelAdded = useCallback((model: ApiModel) => {
    if (!state.user) return
    dispatch({ type: 'ADD_MODEL', userId: state.user.id, model })
  }, [state.user, dispatch])

  const onAvatarUpdate = useCallback((avatarUrl: string) => {
    dispatch({ type: 'SET_AVATAR', avatarUrl })
  }, [dispatch])

  const w = (id: string) => state.windows[id]

  const userForLearner1 = state.users.find(u => u.id === 1)
  const userForLearner2 = state.users.find(u => u.id === 2)
  const titleMap: Record<string, string> = {
    learner1: userForLearner1 ? `${userForLearner1.username} (${userForLearner1.login})` : 'Learner_01.exe',
    tasks: 'Tasks.exe',
    learner2: userForLearner2 ? `${userForLearner2.username} (${userForLearner2.login})` : 'Learner_02.exe',
    score: 'Match_Score.exe',
    profile: 'User_Profile.exe',
  }

  return (
    <div className="win95-desktop">
      <div style={{ flex: 1, position: 'relative', padding: 16, overflow: 'hidden' }}>
          {['learner1', 'tasks', 'learner2', 'score', 'profile'].map(id => {
          const win = w(id)
          if (!win) return null

          const iconMap: Record<string, string> = {
            learner1: 'window', tasks: 'terminal', learner2: 'window',
            score: '', profile: 'person',
          }
          const isSmall = id === 'score' || id === 'profile'
          const isInactive = id === 'learner2'

          let content = null
          if (id === 'learner1' || id === 'learner2') {
            const models = state.models[id] || []
            const showDropZone = (id === 'learner1' && state.user?.id === 1) || (id === 'learner2' && state.user?.id === 2)
            content = <LearnerContent models={models} tasks={state.tasks} token={state.token} onModelAdded={onModelAdded} showDropZone={showDropZone} />
          } else if (id === 'tasks') {
            const models1 = state.models['learner1'] || []
            const models2 = state.models['learner2'] || []
            const ids1 = new Set(models1.filter(m => m.task_id).map(m => m.task_id!))
            const ids2 = new Set(models2.filter(m => m.task_id).map(m => m.task_id!))
            const completedTaskIds = new Set([...ids1].filter(id => ids2.has(id)))
            content = <TasksContent tasks={state.tasks} token={state.token} completedTaskIds={completedTaskIds}
              onAddTask={(t) => dispatch({ type: 'ADD_TASK', task: t })}
              onDeleteTask={(id) => dispatch({ type: 'DELETE_TASK', taskId: id })}
              onReorderTasks={(tasks) => dispatch({ type: 'REORDER_TASKS', tasks })} />
          } else if (id === 'score') {
            const name1 = state.users.find(u => u.id === 1)?.username || 'User 1'
            const name2 = state.users.find(u => u.id === 2)?.username || 'User 2'
            content = <ScoreContent name1={name1} count1={state.score.user1} name2={name2} count2={state.score.user2} />
          } else if (id === 'profile') {
            content = <ProfileContent
              username={state.user?.username || 'Admin'}
              avatarUrl={state.user?.avatarUrl}
              token={state.token}
              onLogout={logout}
              onAvatarUpdate={onAvatarUpdate}
            />
          }

          return (
            <Window key={id} id={id}
              icon={iconMap[id]} title={titleMap[id]}
              x={win.x} y={win.y} right={win.right} bottom={win.bottom}
              width={win.width} height={win.height}
              z={win.zIndex}
              active={state.activeWindow === id}
              minimized={win.minimized}
              small={isSmall}
              inactiveTitle={isInactive}
              onFocus={() => focus(id)}
              onMinimize={() => min(id)}
              onMaximize={() => max(id)}
              onClose={() => close(id)}
              onMove={(x, y) => move(id, x, y)}
            >
              {content}
            </Window>
          )
        })}
      </div>

      <Taskbar
        windows={state.windows}
        activeWindow={state.activeWindow}
        onFocus={focus}
        onRestore={restore}
        onLogout={logout}
        titles={titleMap}
      />

      {!state.authenticated && (
        <>
          <div className="win-blur" />
          <LoginModal onLogin={(token, user) => dispatch({ type: 'LOGIN', token, user })} />
        </>
      )}
    </div>
  )
})

export default Desktop
