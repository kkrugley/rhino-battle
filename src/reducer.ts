import type { AppState, AppAction, ApiModel, User } from './types'
import { defaultWindows, initialTasks, initialLeaderboard } from './data'

export function createInitialState(): AppState {
  return {
    authenticated: false,
    user: null,
    token: null,
    activeWindow: 'tasks',
    windows: { ...defaultWindows },
    tasks: initialTasks,
    models: {},
    score: { user1: 0, user2: 0 },
    leaderboard: initialLeaderboard,
    dataLoaded: false,
    users: [],
  }
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, authenticated: true, user: action.user, token: action.token }

    case 'LOGOUT': {
      const fresh = createInitialState()
      return { ...fresh, authenticated: false, user: null, token: null }
    }

    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.taskId) }

    case 'REORDER_TASKS':
      return { ...state, tasks: action.tasks }

    case 'ADD_MODEL': {
      const key = action.userId === 1 ? 'learner1' : 'learner2'
      const existing = state.models[key] || []
      const scoreKey = action.userId === 1 ? 'user1' : 'user2'
      return {
        ...state,
        models: { ...state.models, [key]: [action.model, ...existing] },
        score: { ...state.score, [scoreKey]: state.score[scoreKey] + 1 },
      }
    }

    case 'SET_AVATAR': {
      if (!state.user) return state
      const updated = { ...state.user, avatarUrl: action.avatarUrl }
      localStorage.setItem('user', JSON.stringify(updated))
      return { ...state, user: updated }
    }

    case 'SET_USERS': {
      const users: User[] = action.users.map((u: any) => ({
        id: u.id,
        login: u.login,
        username: u.username,
        avatarUrl: u.avatar_url ?? null,
      }))
      let user = state.user
      if (user) {
        const matched = users.find(u => u.id === user!.id)
        if (matched) user = { ...user, avatarUrl: matched.avatarUrl }
      }
      return { ...state, users, user }
    }

    case 'SET_DATA':
      return {
        ...state,
        tasks: action.tasks,
        models: action.models,
        score: action.score,
        dataLoaded: true,
      }

    case 'FOCUS_WINDOW': {
      const w = state.windows[action.id]
      if (!w || w.minimized) return state
      const maxZ = Math.max(...Object.values(state.windows).map(x => x.zIndex), 0)
      const newWindows = Object.entries(state.windows).reduce((acc, [id, win]) => {
        acc[id] = { ...win, zIndex: id === action.id ? maxZ + 1 : win.zIndex }
        return acc
      }, {} as Record<string, typeof w>)
      return { ...state, windows: newWindows, activeWindow: action.id }
    }

    case 'MINIMIZE': {
      const win = state.windows[action.id]
      if (!win) return state
      return {
        ...state,
        windows: { ...state.windows, [action.id]: { ...win, minimized: true } },
        activeWindow: state.activeWindow === action.id ? null : state.activeWindow,
      }
    }

    case 'MAXIMIZE': {
      const win = state.windows[action.id]
      if (!win) return state
      return {
        ...state,
        windows: { ...state.windows, [action.id]: { ...win, maximized: !win.maximized } },
      }
    }

    case 'RESTORE': {
      const win = state.windows[action.id]
      if (!win) return state
      return {
        ...state,
        windows: { ...state.windows, [action.id]: { ...win, minimized: false } },
        activeWindow: action.id,
      }
    }

    case 'CLOSE':
      return {
        ...state,
        windows: { ...state.windows, [action.id]: { ...state.windows[action.id], minimized: true } },
        activeWindow: state.activeWindow === action.id ? null : state.activeWindow,
      }

    case 'MOVE': {
      const w = state.windows[action.id]
      if (!w) return state
      return {
        ...state,
        windows: { ...state.windows, [action.id]: { ...w, x: action.x, y: action.y, right: null, bottom: null } },
      }
    }

    default:
      return state
  }
}
