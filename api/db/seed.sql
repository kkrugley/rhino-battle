INSERT INTO users (login, password_hash, username, avatar_url) VALUES
  ('learner1', 'sha256$ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Leo', NULL),
  ('learner2', 'sha256$c6ba91b90d922e159893f46c387e5dc1b3dc5c101a5a4522f03b987177a24a91', 'Nina', NULL)
ON CONFLICT (login) DO NOTHING;

INSERT INTO tasks (title, difficulty, description, main_image_url, sort_order) VALUES
  ('Low Poly Rhino Mesh', 'Hard', 'Create a low-polygon rhino model in Rhino 3D. Focus on accurate topology and clean mesh flow.', 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', 1),
  ('Mechanical Joint Blueprint', 'Medium', 'Design a mechanical joint assembly. Ensure proper tolerances and moving part clearances.', 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb', 2),
  ('Ergonomic Chair Study', 'Medium', 'Model an ergonomic office chair with adjustable components. Focus on proportions and comfort.', 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb', 3),
  ('Organic Surface Modeling', 'Hard', 'Create an organic freeform surface using SubD tools in Rhino. Smooth curvature is critical.', 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/WaterBottle/glTF-Binary/WaterBottle.glb', 4)
ON CONFLICT (title) DO UPDATE SET sort_order = EXCLUDED.sort_order;

-- Demo task with main image + 5 reference images (no 3D model)
WITH new_task AS (
  INSERT INTO tasks (title, difficulty, description, main_image_url, sort_order)
  VALUES ('Vintage Camera Study', 'Easy', 'Model a vintage film camera. Use reference images for proportions and mechanical details.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', 5)
  ON CONFLICT DO NOTHING
  RETURNING id
)
INSERT INTO task_images (task_id, image_url)
SELECT id, url FROM new_task, (VALUES
  ('https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'),
  ('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'),
  ('https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=400'),
  ('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
  ('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400')
) AS t(url)
ON CONFLICT DO NOTHING;
