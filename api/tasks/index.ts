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
    const tasks = await sql`SELECT id, title, difficulty, description, deadline, main_image_url, created_at FROM tasks ORDER BY created_at DESC`
    return res.status(200).json(tasks)
  }

  if (req.method === 'POST') {
    const { title, difficulty, description, deadline, mainImageUrl } = req.body
    if (!title || !difficulty) return res.status(400).json({ error: 'Title and difficulty required' })

    const [task] = await sql`
      INSERT INTO tasks (title, difficulty, description, deadline, main_image_url)
      VALUES (${title}, ${difficulty}, ${description || ''}, ${deadline || null}, ${mainImageUrl || null})
      RETURNING id, title, difficulty, description, deadline, main_image_url, created_at
    `
    return res.status(201).json(task)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
