import { memo, useCallback, useEffect, useRef } from 'react'
import type { AppState, AppAction, ApiTask, ApiModel } from '../types'
import LoginModal from './LoginModal'
import Taskbar from './Taskbar'
import Window from './Window'
import LearnerContent from './LearnerContent'
import TasksContent from './TasksContent'
import ScoreContent from './ScoreContent'
import LeaderboardContent from './LeaderboardContent'
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

      const [tasksRes, m1, m2, scoreRes] = await Promise.all([
        fetch(API + '/tasks', { headers }),
        fetch(API + '/models/1', { headers }),
        fetch(API + '/models/2', { headers }),
        fetch(API + '/score', { headers }),
      ])

      const [tasks, models1, models2, score]: [ApiTask[], ApiModel[], ApiModel[], { user1: number; user2: number }] = await Promise.all([
        tasksRes.json(), m1.json(), m2.json(), scoreRes.json(),
      ])

      dispatch({
        type: 'SET_DATA',
        tasks,
        models: { learner1: models1, learner2: models2 },
        score,
      })
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

  const w = (id: string) => state.windows[id]

  return (
    <div className="win95-desktop">
      <div style={{ flex: 1, position: 'relative', padding: 16, overflow: 'hidden' }}>
        {['learner1', 'tasks', 'learner2', 'score', 'leaderboard', 'profile'].map(id => {
          const win = w(id)
          if (!win) return null

          const iconMap: Record<string, string> = {
            learner1: 'window', tasks: 'terminal', learner2: 'window',
            score: '', leaderboard: '', profile: 'person',
          }
          const titleMap: Record<string, string> = {
            learner1: 'Learner_01.exe', tasks: 'Tasks.exe', learner2: 'Learner_02.exe',
            score: 'Match_Score.exe', leaderboard: 'Leaderboard.exe', profile: 'User_Profile.exe',
          }
          const isSmall = id === 'score' || id === 'leaderboard' || id === 'profile'
          const isInactive = id === 'learner2' || id === 'leaderboard'

          let content = null
          if (id === 'learner1' || id === 'learner2') {
            const models = state.models[id] || []
            content = <LearnerContent models={models} />
          } else if (id === 'tasks') {
            content = <TasksContent tasks={state.tasks} token={state.token} onAddTask={(t) => dispatch({ type: 'ADD_TASK', task: t })} />
          } else if (id === 'score') {
            content = <ScoreContent user1={state.score.user1} user2={state.score.user2} />
          } else if (id === 'leaderboard') {
            content = <LeaderboardContent entries={state.leaderboard} />
          } else if (id === 'profile') {
            content = <ProfileContent
              username={state.user?.username || 'Admin'}
              avatarUrl={state.user?.avatarUrl}
              onLogout={logout}
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
