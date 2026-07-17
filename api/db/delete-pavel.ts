import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const sql = neon(process.env.DATABASE_URL!)
  const r = await sql`DELETE FROM models WHERE user_id = 2 RETURNING id`
  res.status(200).json({ deleted: r.length, ids: r.map(x => x.id) })
}
