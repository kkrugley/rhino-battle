import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import { jwtVerify } from 'jose'

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'rhino-battle-secret-key-change-in-production')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try { await jwtVerify(token, JWT_SECRET) } catch (_e) { return res.status(401).json({ error: 'Invalid token' }) }

  const id = req.query.id as string

  if (req.method === 'GET') {
    const [task] = await sql`SELECT * FROM tasks WHERE id = ${id}`
    if (!task) return res.status(404).json({ error: 'Not found' })
    const images = await sql`SELECT id, image_url FROM task_images WHERE task_id = ${id}`
    return res.status(200).json({ ...task, images })
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM tasks WHERE id = ${id}`
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
