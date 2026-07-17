import type { WindowState, ApiTask } from './types'

export const defaultWindows: Record<string, WindowState> = {
  learner1: { id: 'learner1', minimized: false, maximized: false, zIndex: 10, x: 16, y: 16, right: null, bottom: null, width: 320, height: 750 },
  tasks: { id: 'tasks', minimized: false, maximized: false, zIndex: 20, x: 360, y: 48, right: null, bottom: null, width: 400, height: 500 },
  learner2: { id: 'learner2', minimized: false, maximized: false, zIndex: 9, x: null, y: 32, right: 32, bottom: null, width: 320, height: 750 },
  score: { id: 'score', minimized: false, maximized: false, zIndex: 10, x: 16, y: null, right: null, bottom: 80, width: 192, height: 0 },
  profile: { id: 'profile', minimized: false, maximized: false, zIndex: 8, x: null, y: null, right: 560, bottom: 80, width: 192, height: 0 },
}

export const initialTasks: ApiTask[] = [
  {
    id: 1,
    title: 'Low Poly Rhino Mesh',
    difficulty: 'Hard',
    description: 'Create a low-polygon rhino model in Rhino 3D.',
    deadline: null,
    main_image_url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    created_at: '2026-07-17T00:00:00Z',
  },
  {
    id: 2,
    title: 'Mechanical Joint Blueprint',
    difficulty: 'Medium',
    description: 'Design a mechanical joint assembly.',
    deadline: null,
    main_image_url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    created_at: '2026-07-17T00:00:00Z',
  },
]

export const initialLeaderboard = [
  { name: 'Lrn_01', score: 1200 },
  { name: 'Lrn_02', score: 950 },
  { name: 'Lrn_03', score: 800 },
]
