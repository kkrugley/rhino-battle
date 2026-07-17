import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import { jwtVerify } from 'jose'

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'rhino-battle-secret-key-change-in-production')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try { await jwtVerify(token, JWT_SECRET) } catch (_e) { return res.status(401).json({ error: 'Invalid token' }) }

  const userId = req.query.userId as string

  if (req.method === 'GET') {
    const models = await sql`
      SELECT id, user_id, task_id, filename, file_url, status, uploaded_at
      FROM models WHERE user_id = ${userId}
      ORDER BY uploaded_at DESC
    `
    return res.status(200).json(models)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
