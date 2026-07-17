import type { Task, LeaderEntry, LearnerModel, WindowState } from './types'

export const defaultWindows: Record<string, WindowState> = {
  learner1: { id: 'learner1', minimized: false, maximized: false, zIndex: 10, x: 16, y: 16, right: null, bottom: null, width: 320, height: 750 },
  tasks: { id: 'tasks', minimized: false, maximized: false, zIndex: 20, x: 360, y: 48, right: null, bottom: null, width: 400, height: 500 },
  learner2: { id: 'learner2', minimized: false, maximized: false, zIndex: 9, x: null, y: 32, right: 32, bottom: null, width: 320, height: 750 },
  score: { id: 'score', minimized: false, maximized: false, zIndex: 10, x: 16, y: null, right: null, bottom: 80, width: 192, height: 0 },
  leaderboard: { id: 'leaderboard', minimized: false, maximized: false, zIndex: 9, x: null, y: null, right: 350, bottom: 80, width: 192, height: 0 },
  profile: { id: 'profile', minimized: false, maximized: false, zIndex: 8, x: null, y: null, right: 560, bottom: 80, width: 192, height: 0 },
}

export const initialTasks: Task[] = [
  {
    title: 'Low Poly Rhino Mesh',
    diff: 'Hard',
    thumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCs0ISaZzW_eHVcwJMMVj-xmIAIghMSgP8-Amj5hX6NqpGT0GpvCcPqBZH7_kLPbmBY9A9X_Q7rvJv68rp1GOCGS-jRyQ95i_GuujDEv-vkXHXImnNXi2mPKy_wbLjqPr1G6LrzoTuDAvak83oAV528WyLYK-gYtFXeoyUBVp4qFhAMWCPU-yyaWly6OE54ia93DvqtIyzQ9xIEz4dLRWJvlKGechbPVN0mFry6TlhhYxQAE4u_JzdbYDx7Bxr9dkax-tYdp9z_Ffo',
  },
  {
    title: 'Mechanical Joint Blueprint',
    diff: 'Medium',
    thumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADYpHFFEyuqCB9wOLXvJ8Q67GCrZal734Eo8wi7iBCdxs_zX0VLOb9JfptFzcGewdIMpR3WEuzb3KRe4i_iDxUDHu4nb2pe6uh2NTAdprQ57wnZ4c4XeFLR7kAXkcu7KLDbGreUbDDKVzz1CAOeUe9QiZj_6oZ9StZYAy4FQ_5W0UaOxotkUlA3RAW-Q3VzCP845uES4uzP0zU112HBc89KRFTWMBn50x_DkUCThkEqnMZXgyiQFzNUeyUib48wHovQ-U5i-irmPUx',
  },
]

export const initialLeaderboard: LeaderEntry[] = [
  { name: 'Lrn_01', score: 1200 },
  { name: 'Lrn_02', score: 950 },
  { name: 'Lrn_03', score: 800 },
]

export const initialLearnerModels: Record<string, LearnerModel> = {
  learner1: { name: 'Rhino_V1.obj', status: 'Completed', time: '10:42 AM' },
  learner2: { name: 'Rhino_V2.obj', status: 'Completed', time: '11:15 AM' },
  learner3: { name: 'Rhino_X1.obj', status: 'Completed', time: '09:15 AM' },
  learner4: { name: 'Rhino_X2.obj', status: 'Completed', time: '10:00 AM' },
}
