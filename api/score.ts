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

  const [user1] = await sql`SELECT id FROM users WHERE login = 'learner1' LIMIT 1`
  const [user2] = await sql`SELECT id FROM users WHERE login = 'learner2' LIMIT 1`

  const count1 = user1 ? (await sql`SELECT COUNT(*)::int as count FROM models WHERE user_id = ${user1.id}`)[0].count : 0
  const count2 = user2 ? (await sql`SELECT COUNT(*)::int as count FROM models WHERE user_id = ${user2.id}`)[0].count : 0

  res.status(200).json({ user1: count1, user2: count2 })
}
