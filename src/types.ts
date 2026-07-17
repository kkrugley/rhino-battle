export interface User {
  id: number
  login: string
  username: string
  avatarUrl: string | null
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiTask {
  id: number
  title: string
  difficulty: 'Hard' | 'Medium'
  description: string
  deadline: string | null
  main_image_url: string | null
  created_at: string
  images?: ApiTaskImage[]
}

export interface ApiTaskImage {
  id: number
  image_url: string
}

export interface ApiModel {
  id: number
  user_id: number
  task_id: number | null
  filename: string
  file_url: string | null
  status: string
  uploaded_at: string
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
  user: User | null
  token: string | null
  activeWindow: string | null
  windows: Record<string, WindowState>
  tasks: ApiTask[]
  models: Record<string, ApiModel[]>
  score: { user1: number; user2: number }
  leaderboard: { name: string; score: number }[]
  dataLoaded: boolean
}

export type AppAction =
  | { type: 'LOGIN'; user: User; token: string }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TASK'; task: ApiTask }
  | { type: 'SET_DATA'; tasks: ApiTask[]; models: Record<string, ApiModel[]>; score: { user1: number; user2: number } }
  | { type: 'FOCUS_WINDOW'; id: string }
  | { type: 'MINIMIZE'; id: string }
  | { type: 'MAXIMIZE'; id: string }
  | { type: 'RESTORE'; id: string }
  | { type: 'CLOSE'; id: string }
  | { type: 'MOVE'; id: string; x: number; y: number }
