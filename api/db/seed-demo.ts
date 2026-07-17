import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const [task] = await sql`
    INSERT INTO tasks (title, difficulty, description, main_image_url, sort_order)
    VALUES ('Vintage Camera Study', 'Easy', 'Model a vintage film camera. Use reference images for proportions and mechanical details.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', 5)
    ON CONFLICT (title) DO UPDATE SET sort_order = EXCLUDED.sort_order
    RETURNING id
  `
  if (task) {
    await sql`
      INSERT INTO task_images (task_id, image_url)
      VALUES
        (${task.id}, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'),
        (${task.id}, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'),
        (${task.id}, 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=400'),
        (${task.id}, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
        (${task.id}, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400')
      ON CONFLICT DO NOTHING
    `
  }
  return res.status(200).json({ ok: true, taskId: task?.id })
}
