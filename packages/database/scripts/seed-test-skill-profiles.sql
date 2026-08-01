-- Idempotent seed for a couple of public Skill Profiles (browse/demo data).
-- Identified by clerk_user_id prefix test-candidate: for easy cleanup.

INSERT INTO skills (name) VALUES
  ('TypeScript'),
  ('React'),
  ('Node.js'),
  ('PostgreSQL'),
  ('Python'),
  ('SQL'),
  ('Data Analysis'),
  ('Figma'),
  ('UX Research'),
  ('Design Systems')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (
  clerk_user_id,
  role,
  email,
  first_name,
  last_name,
  city,
  country,
  professional_title,
  career_summary,
  remote_preference,
  availability,
  years_of_experience,
  profile_completed
) VALUES
(
  'test-candidate:maya-chen',
  'job_seeker',
  'test.maya.chen@example.com',
  'Maya',
  'Chen',
  'Manchester',
  'GB',
  'Full-stack Engineer',
  'Builds product-facing web apps with TypeScript and React. Comfortable owning features end to end — API design, UI, and shipping.',
  'hybrid',
  'within_one_month',
  6,
  true
),
(
  'test-candidate:jordan-okonkwo',
  'job_seeker',
  'test.jordan.okonkwo@example.com',
  'Jordan',
  'Okonkwo',
  'London',
  'GB',
  'Data Analyst',
  'Turns messy operational data into clear decisions for ops and finance teams. Strong in SQL, Python, and stakeholder reporting.',
  'remote',
  'immediate',
  4,
  true
),
(
  'test-candidate:samira-patel',
  'job_seeker',
  'test.samira.patel@example.com',
  'Samira',
  'Patel',
  'Bristol',
  'GB',
  'Product Designer',
  'Designs clear B2B workflows with research-backed prototypes and scalable design systems.',
  'hybrid',
  'freelance',
  5,
  true
)
ON CONFLICT (clerk_user_id) DO UPDATE SET
  role = EXCLUDED.role,
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  professional_title = EXCLUDED.professional_title,
  career_summary = EXCLUDED.career_summary,
  remote_preference = EXCLUDED.remote_preference,
  availability = EXCLUDED.availability,
  years_of_experience = EXCLUDED.years_of_experience,
  profile_completed = true,
  deleted_at = NULL,
  updated_at = now();

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN ('TypeScript', 'React', 'Node.js', 'PostgreSQL')
WHERE u.clerk_user_id = 'test-candidate:maya-chen'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN ('Python', 'SQL', 'Data Analysis')
WHERE u.clerk_user_id = 'test-candidate:jordan-okonkwo'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN ('Figma', 'UX Research', 'Design Systems')
WHERE u.clerk_user_id = 'test-candidate:samira-patel'
ON CONFLICT DO NOTHING;

DELETE FROM projects
WHERE user_id IN (
  SELECT id FROM users WHERE clerk_user_id LIKE 'test-candidate:%'
);

INSERT INTO projects (user_id, title, description, role, sort_order)
SELECT id,
  'Warehouse inventory dashboard',
  'Real-time stock and fulfilment views for warehouse ops, with role-based access and audit history.',
  'Lead engineer',
  0
FROM users WHERE clerk_user_id = 'test-candidate:maya-chen';

INSERT INTO projects (user_id, title, description, role, sort_order)
SELECT id,
  'Ops KPI reporting suite',
  'Automated weekly packs for ops leadership: incident trends, SLA breaches, and cost drivers.',
  'Analyst',
  0
FROM users WHERE clerk_user_id = 'test-candidate:jordan-okonkwo';

INSERT INTO projects (user_id, title, description, role, sort_order)
SELECT id,
  'B2B onboarding redesign',
  'Cut time-to-first-value for new business customers with a guided setup flow and clearer empty states.',
  'Product designer',
  0
FROM users WHERE clerk_user_id = 'test-candidate:samira-patel';
