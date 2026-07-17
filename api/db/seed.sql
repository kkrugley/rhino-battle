INSERT INTO users (login, password_hash, username, avatar_url) VALUES
  ('learner1', 'sha256$ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Leo', NULL),
  ('learner2', 'sha256$c6ba91b90d922e159893f46c387e5dc1b3dc5c101a5a4522f03b987177a24a91', 'Nina', NULL)
ON CONFLICT (login) DO NOTHING;

INSERT INTO tasks (title, difficulty, description, main_image_url) VALUES
  ('Low Poly Rhino Mesh', 'Hard', 'Create a low-polygon rhino model in Rhino 3D. Focus on accurate topology and clean mesh flow.', 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'),
  ('Mechanical Joint Blueprint', 'Medium', 'Design a mechanical joint assembly. Ensure proper tolerances and moving part clearances.', 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb'),
  ('Ergonomic Chair Study', 'Medium', 'Model an ergonomic office chair with adjustable components. Focus on proportions and comfort.', 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb'),
  ('Organic Surface Modeling', 'Hard', 'Create an organic freeform surface using SubD tools in Rhino. Smooth curvature is critical.', 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/WaterBottle/glTF-Binary/WaterBottle.glb')
ON CONFLICT DO NOTHING;
