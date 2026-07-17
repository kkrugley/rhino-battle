import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import { jwtVerify } from 'jose'
import { createHash } from 'crypto'

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'rhino-battle-secret-key-change-in-production')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  let user: any
  try { user = await jwtVerify(token, JWT_SECRET) } catch { return res.status(401).json({ error: 'Invalid token' }) }

  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password required' })
  if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' })

  const hash = 'sha256$' + createHash('sha256').update(currentPassword).digest('hex')
  const [row] = await sql`SELECT id FROM users WHERE id = ${user.payload.userId} AND password_hash = ${hash}`
  if (!row) return res.status(403).json({ error: 'Current password is incorrect' })

  const newHash = 'sha256$' + createHash('sha256').update(newPassword).digest('hex')
  await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${user.payload.userId}`

  res.status(200).json({ ok: true })
}
