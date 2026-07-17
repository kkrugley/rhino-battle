import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import { jwtVerify } from 'jose'

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'rhino-battle-secret-key-change-in-production')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  let user: any
  try { user = await jwtVerify(token, JWT_SECRET) } catch { return res.status(401).json({ error: 'Invalid token' }) }

  const { avatarUrl } = req.body
  if (typeof avatarUrl !== 'string') return res.status(400).json({ error: 'avatarUrl required' })

  await sql`UPDATE users SET avatar_url = ${avatarUrl} WHERE id = ${user.payload.userId}`

  res.status(200).json({ avatarUrl })
}
