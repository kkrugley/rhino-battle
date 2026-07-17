import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import { SignJWT } from 'jose'
import { createHash } from 'crypto'

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'rhino-battle-secret-key-change-in-production')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { login, password } = req.body
  if (!login || !password) return res.status(400).json({ error: 'Login and password required' })

  const hash = 'sha256$' + createHash('sha256').update(password).digest('hex')

  const [user] = await sql`SELECT id, login, username, avatar_url, password_hash FROM users WHERE login = ${login}`

  if (!user || user.password_hash !== hash) return res.status(401).json({ error: 'Invalid credentials' })

  const token = await new SignJWT({
    userId: user.id,
    login: user.login,
    username: user.username,
    avatarUrl: user.avatar_url,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  res.status(200).json({
    token,
    user: {
      id: user.id,
      login: user.login,
      username: user.username,
      avatarUrl: user.avatar_url,
    },
  })
}
