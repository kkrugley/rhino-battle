import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'rhino-battle-secret-key-change-in-production')

async function getUser(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: number; login: string; username: string }
  } catch { return null }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = req.headers.authorization?.replace('Bearer ', '')
  if (!auth) return res.status(401).json({ error: 'Unauthorized' })

  const user = await getUser(auth)
  if (!user) return res.status(401).json({ error: 'Invalid token' })

  const body = req.body as HandleUploadBody

  const jsonResponse = await handleUpload({
    body,
    request: req,
    onBeforeGenerateToken: async (_pathname: string, clientPayload: string | null) => {
      const cp = clientPayload ? JSON.parse(clientPayload) : {}
      return {
        allowedContentTypes: ['*/*'],
        maximumSizeInBytes: 50 * 1024 * 1024,
        tokenPayload: JSON.stringify({ userId: user.userId, taskId: cp.taskId || null }),
      }
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      if (!tokenPayload) return
      const { userId, taskId } = JSON.parse(tokenPayload)
      const { neon } = await import('@neondatabase/serverless')
      const sql = neon(process.env.DATABASE_URL!)
      const filename = blob.pathname.split('/').pop() || 'model'
      await sql`
        INSERT INTO models (user_id, task_id, filename, file_url, status)
        VALUES (${userId}, ${taskId}, ${filename}, ${blob.url}, 'completed')
      `
    },
  })

  res.json(jsonResponse)
}
