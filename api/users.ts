import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import { jwtVerify } from 'jose'

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'rhino-battle-secret-key-change-in-production')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try { await jwtVerify(token, JWT_SECRET) } catch { return res.status(401).json({ error: 'Invalid token' }) }
  const users = await sql`SELECT id, login, username, avatar_url FROM users ORDER BY id ASC`
  return res.status(200).json(users)
}
