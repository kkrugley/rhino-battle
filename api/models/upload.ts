import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import { jwtVerify } from 'jose'

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'rhino-battle-secret-key-change-in-production')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  let user: any
  try { user = await jwtVerify(token, JWT_SECRET) } catch (_e) { return res.status(401).json({ error: 'Invalid token' }) }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { taskId, filename, fileUrl } = req.body
  if (!filename) return res.status(400).json({ error: 'Filename required' })

  const [model] = await sql`
    INSERT INTO models (user_id, task_id, filename, file_url, status)
    VALUES (${user.payload.userId}, ${taskId || null}, ${filename}, ${fileUrl || null}, 'completed')
    RETURNING id, user_id, task_id, filename, file_url, status, uploaded_at
  `

  res.status(201).json(model)
}
