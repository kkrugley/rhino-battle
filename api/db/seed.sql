INSERT INTO users (login, password_hash, username, avatar_url) VALUES
  ('learner1', 'sha256$8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Leo', NULL),
  ('learner2', 'sha256$5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Nina', NULL)
ON CONFLICT (login) DO NOTHING;

INSERT INTO tasks (title, difficulty, description, main_image_url) VALUES
  ('Low Poly Rhino Mesh', 'Hard', 'Create a low-polygon rhino model in Rhino 3D. Focus on accurate topology and clean mesh flow.', 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'),
  ('Mechanical Joint Blueprint', 'Medium', 'Design a mechanical joint assembly. Ensure proper tolerances and moving part clearances.', 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb'),
  ('Ergonomic Chair Study', 'Medium', 'Model an ergonomic office chair with adjustable components. Focus on proportions and comfort.', 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb'),
  ('Organic Surface Modeling', 'Hard', 'Create an organic freeform surface using SubD tools in Rhino. Smooth curvature is critical.', 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/WaterBottle/glTF-Binary/WaterBottle.glb')
ON CONFLICT DO NOTHING;
