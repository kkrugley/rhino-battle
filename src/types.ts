export interface Task {
  title: string
  diff: 'Hard' | 'Medium'
  thumb: string
}

export interface LearnerModel {
  name: string
  status: string
  time: string
}

export interface LeaderEntry {
  name: string
  score: number
}

export interface WindowState {
  id: string
  minimized: boolean
  maximized: boolean
  zIndex: number
  x: number | null
  y: number | null
  right: number | null
  bottom: number | null
  width: number | string
  height: number | string
}

export interface AppState {
  authenticated: boolean
  username: string
  activeWindow: string | null
  windows: Record<string, WindowState>
  timer: number
  leaderboard: LeaderEntry[]
  tasks: Task[]
  learnerModels: Record<string, LearnerModel>
}

export type AppAction =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'TICK' }
  | { type: 'FOCUS_WINDOW'; id: string }
  | { type: 'MINIMIZE'; id: string }
  | { type: 'MAXIMIZE'; id: string }
  | { type: 'RESTORE'; id: string }
  | { type: 'CLOSE'; id: string }
  | { type: 'MOVE'; id: string; x: number; y: number }
