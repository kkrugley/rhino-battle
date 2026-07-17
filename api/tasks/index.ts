import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import { jwtVerify } from 'jose'

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'rhino-battle-secret-key-change-in-production')

async function getUser(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: number; login: string; username: string }
  } catch (_e) { return null }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const user = await getUser(token)
  if (!user) return res.status(401).json({ error: 'Invalid token' })

  if (req.method === 'GET') {
    const tasks = await sql`SELECT id, title, difficulty, description, deadline, main_image_url, sort_order, created_at FROM tasks ORDER BY sort_order ASC, id ASC`
    return res.status(200).json(tasks)
  }

  if (req.method === 'POST') {
    const { title, difficulty, description, deadline, mainImageUrl, taskImages } = req.body
    if (!title || !difficulty) return res.status(400).json({ error: 'Title and difficulty required' })

    const [{ maxOrder }] = await sql`SELECT COALESCE(MAX(sort_order), 0) + 1 AS max_order FROM tasks`
    const [task] = await sql`
      INSERT INTO tasks (title, difficulty, description, deadline, main_image_url, sort_order)
      VALUES (${title}, ${difficulty}, ${description || ''}, ${deadline || null}, ${mainImageUrl || null}, ${maxOrder})
      RETURNING id, title, difficulty, description, deadline, main_image_url, sort_order, created_at
    `
    if (Array.isArray(taskImages) && taskImages.length > 0) {
      for (const url of taskImages.slice(0, 5)) {
        await sql`INSERT INTO task_images (task_id, image_url) VALUES (${task.id}, ${url})`
      }
    }
    return res.status(201).json(task)
  }

  if (req.method === 'PUT') {
    const { taskIds } = req.body
    if (!Array.isArray(taskIds)) return res.status(400).json({ error: 'taskIds array required' })

    for (let i = 0; i < taskIds.length; i++) {
      await sql`UPDATE tasks SET sort_order = ${i + 1} WHERE id = ${taskIds[i]}`
    }
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
