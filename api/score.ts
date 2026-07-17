import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import { jwtVerify } from 'jose'

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'rhino-battle-secret-key-change-in-production')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try { await jwtVerify(token, JWT_SECRET) } catch (_e) { return res.status(401).json({ error: 'Invalid token' }) }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const rows = await sql`SELECT u.id, COUNT(m.id)::int as count FROM users u LEFT JOIN models m ON m.user_id = u.id GROUP BY u.id ORDER BY u.id`

  const user1 = rows[0]?.count ?? 0
  const user2 = rows[1]?.count ?? 0

  res.status(200).json({ user1, user2 })
}
