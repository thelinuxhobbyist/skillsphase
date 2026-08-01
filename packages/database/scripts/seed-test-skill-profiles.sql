-- Idempotent seed for public Skill Profiles with multi-capability + evidence.
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
  ('Design Systems'),
  ('API Design'),
  ('System Design'),
  ('Leadership'),
  ('Performance'),
  ('dbt'),
  ('Looker'),
  ('Prototyping')
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
  primary_capability,
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
  'Builds scalable web applications',
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
  'Turns operational data into decisions',
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
  'Designs clear B2B product workflows',
  'Designs clear B2B workflows with research-backed prototypes and scalable design systems.',
  'hybrid',
  'freelance',
  5,
  true
),
(
  'test-candidate:alex-rivera',
  'job_seeker',
  'test.alex.rivera@example.com',
  'Alex',
  'Rivera',
  'Leeds',
  'GB',
  'Platform Engineer',
  'Builds reliable internal platforms',
  'Owns developer platforms and CI systems that help product teams ship safely.',
  'remote',
  'permanent',
  7,
  true
),
(
  'test-candidate:riley-okafor',
  'job_seeker',
  'test.riley.okafor@example.com',
  'Riley',
  'Okafor',
  'Edinburgh',
  'GB',
  'Full-stack Product Engineer',
  'Ships customer-facing products end to end',
  'Builds and ships product features with clear outcomes — from API design through UI polish. Comfortable pairing with design and talking trade-offs with stakeholders.',
  'hybrid',
  'immediate',
  8,
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
  primary_capability = EXCLUDED.primary_capability,
  career_summary = EXCLUDED.career_summary,
  remote_preference = EXCLUDED.remote_preference,
  availability = EXCLUDED.availability,
  years_of_experience = EXCLUDED.years_of_experience,
  profile_completed = true,
  deleted_at = NULL,
  updated_at = now();

-- Full contact + rate fields for the showcase profile.
UPDATE users SET
  phone_number = '+44 7700 900123',
  salary_min = 65000,
  salary_max = 85000,
  salary_currency = 'GBP',
  updated_at = now()
WHERE clerk_user_id = 'test-candidate:riley-okafor';

-- Reset linked evidence for test candidates.
DELETE FROM capability_projects
WHERE capability_id IN (
  SELECT cc.id FROM candidate_capabilities cc
  JOIN users u ON u.id = cc.user_id
  WHERE u.clerk_user_id LIKE 'test-candidate:%'
);

DELETE FROM capability_skills
WHERE capability_id IN (
  SELECT cc.id FROM candidate_capabilities cc
  JOIN users u ON u.id = cc.user_id
  WHERE u.clerk_user_id LIKE 'test-candidate:%'
);

DELETE FROM candidate_capabilities
WHERE user_id IN (
  SELECT id FROM users WHERE clerk_user_id LIKE 'test-candidate:%'
);

DELETE FROM user_skills
WHERE user_id IN (
  SELECT id FROM users WHERE clerk_user_id LIKE 'test-candidate:%'
);

DELETE FROM recommendations
WHERE user_id IN (
  SELECT id FROM users WHERE clerk_user_id LIKE 'test-candidate:%'
);

DELETE FROM qualifications
WHERE user_id IN (
  SELECT id FROM users WHERE clerk_user_id LIKE 'test-candidate:%'
);

DELETE FROM employment_history
WHERE user_id IN (
  SELECT id FROM users WHERE clerk_user_id LIKE 'test-candidate:%'
);

DELETE FROM education
WHERE user_id IN (
  SELECT id FROM users WHERE clerk_user_id LIKE 'test-candidate:%'
);

DELETE FROM projects
WHERE user_id IN (
  SELECT id FROM users WHERE clerk_user_id LIKE 'test-candidate:%'
);

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN ('TypeScript', 'React', 'Node.js', 'PostgreSQL', 'API Design', 'System Design', 'Performance')
WHERE u.clerk_user_id = 'test-candidate:maya-chen'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN ('Python', 'SQL', 'Data Analysis', 'dbt', 'Looker')
WHERE u.clerk_user_id = 'test-candidate:jordan-okonkwo'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN ('Figma', 'UX Research', 'Design Systems', 'Prototyping')
WHERE u.clerk_user_id = 'test-candidate:samira-patel'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN ('TypeScript', 'Node.js', 'PostgreSQL', 'System Design', 'Leadership')
WHERE u.clerk_user_id = 'test-candidate:alex-rivera'
ON CONFLICT DO NOTHING;

-- Maya: two evidence projects
INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Warehouse Inventory Dashboard',
  'Real-time stock and fulfilment views for warehouse ops, with role-based access and audit history.',
  'Reduced warehouse lookup times by 80%.',
  'Lead Engineer',
  '["React","TypeScript","PostgreSQL","Node.js"]'::jsonb,
  true,
  0
FROM users WHERE clerk_user_id = 'test-candidate:maya-chen';

INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Customer Portal',
  'Self-serve account and order management for B2B customers, replacing email-driven support.',
  'Cut support ticket volume by 35% in the first quarter.',
  'Full-stack Engineer',
  '["React","TypeScript","Node.js"]'::jsonb,
  false,
  1
FROM users WHERE clerk_user_id = 'test-candidate:maya-chen';

-- Jordan
INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Ops KPI Reporting Suite',
  'Automated weekly packs for ops leadership: incident trends, SLA breaches, and cost drivers.',
  'Cut weekly reporting prep from 6 hours to 40 minutes.',
  'Analyst',
  '["Python","SQL","Looker"]'::jsonb,
  true,
  0
FROM users WHERE clerk_user_id = 'test-candidate:jordan-okonkwo';

INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Finance Self-Serve Metrics',
  'Trusted metric layer and dashboards for finance controllers.',
  'Reduced ad-hoc finance data requests by half.',
  'Analytics Engineer',
  '["SQL","dbt","Python"]'::jsonb,
  false,
  1
FROM users WHERE clerk_user_id = 'test-candidate:jordan-okonkwo';

-- Samira
INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'B2B Onboarding Redesign',
  'Guided setup flow and clearer empty states for new business customers.',
  'Improved new-customer activation rate by 28% in the first 30 days.',
  'Product Designer',
  '["Figma","Prototyping"]'::jsonb,
  true,
  0
FROM users WHERE clerk_user_id = 'test-candidate:samira-patel';

INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Design System Foundations',
  'Component library and contribution model shared across product squads.',
  'Reduced UI inconsistency defects by 40% across three product teams.',
  'Design Systems Lead',
  '["Figma","Design Systems"]'::jsonb,
  false,
  1
FROM users WHERE clerk_user_id = 'test-candidate:samira-patel';

-- Alex
INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Developer Platform Portal',
  'Self-serve service templates, golden paths, and observability defaults.',
  'Reduced average service bootstrapping time from 5 days to 1 day.',
  'Platform Lead',
  '["TypeScript","Node.js","PostgreSQL"]'::jsonb,
  true,
  0
FROM users WHERE clerk_user_id = 'test-candidate:alex-rivera';

INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'CI Reliability Programme',
  'Flake reduction, caching, and pipeline SLOs for product engineering.',
  'Improved main-branch CI pass rate from 82% to 97%.',
  'Staff Engineer',
  '["TypeScript","System Design"]'::jsonb,
  false,
  1
FROM users WHERE clerk_user_id = 'test-candidate:alex-rivera';

-- Capabilities for Maya
INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, 'Builds scalable web applications', true, 0
FROM users WHERE clerk_user_id = 'test-candidate:maya-chen';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, label, false, sort_order
FROM users
CROSS JOIN (
  VALUES
    ('API Architecture', 1),
    ('Database Design', 2),
    ('Technical Leadership', 3),
    ('Performance Optimisation', 4)
) AS caps(label, sort_order)
WHERE clerk_user_id = 'test-candidate:maya-chen';

-- Capabilities for Jordan
INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, 'Turns operational data into decisions', true, 0
FROM users WHERE clerk_user_id = 'test-candidate:jordan-okonkwo';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, label, false, sort_order
FROM users
CROSS JOIN (
  VALUES
    ('SQL Modelling', 1),
    ('Executive Reporting', 2),
    ('Data Quality', 3)
) AS caps(label, sort_order)
WHERE clerk_user_id = 'test-candidate:jordan-okonkwo';

-- Capabilities for Samira
INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, 'Designs clear B2B product workflows', true, 0
FROM users WHERE clerk_user_id = 'test-candidate:samira-patel';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, label, false, sort_order
FROM users
CROSS JOIN (
  VALUES
    ('Design Systems', 1),
    ('User Research', 2),
    ('Interaction Design', 3)
) AS caps(label, sort_order)
WHERE clerk_user_id = 'test-candidate:samira-patel';

-- Capabilities for Alex
INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, 'Builds reliable internal platforms', true, 0
FROM users WHERE clerk_user_id = 'test-candidate:alex-rivera';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, label, false, sort_order
FROM users
CROSS JOIN (
  VALUES
    ('Developer Experience', 1),
    ('CI/CD Reliability', 2),
    ('Technical Leadership', 3)
) AS caps(label, sort_order)
WHERE clerk_user_id = 'test-candidate:alex-rivera';

-- Link Maya primary capability → skills + both projects
INSERT INTO capability_skills (capability_id, skill_id)
SELECT cc.id, s.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN skills s ON s.name IN ('React', 'TypeScript', 'Node.js')
WHERE u.clerk_user_id = 'test-candidate:maya-chen'
  AND cc.is_primary = true;

INSERT INTO capability_projects (capability_id, project_id)
SELECT cc.id, p.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN projects p ON p.user_id = u.id
WHERE u.clerk_user_id = 'test-candidate:maya-chen'
  AND cc.is_primary = true;

INSERT INTO capability_skills (capability_id, skill_id)
SELECT cc.id, s.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN skills s ON s.name IN ('API Design', 'Node.js')
WHERE u.clerk_user_id = 'test-candidate:maya-chen'
  AND cc.label = 'API Architecture';

INSERT INTO capability_projects (capability_id, project_id)
SELECT cc.id, p.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN projects p ON p.user_id = u.id AND p.title = 'Customer Portal'
WHERE u.clerk_user_id = 'test-candidate:maya-chen'
  AND cc.label = 'API Architecture';

-- Jordan links
INSERT INTO capability_skills (capability_id, skill_id)
SELECT cc.id, s.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN skills s ON s.name IN ('SQL', 'Python', 'Data Analysis')
WHERE u.clerk_user_id = 'test-candidate:jordan-okonkwo'
  AND cc.is_primary = true;

INSERT INTO capability_projects (capability_id, project_id)
SELECT cc.id, p.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN projects p ON p.user_id = u.id
WHERE u.clerk_user_id = 'test-candidate:jordan-okonkwo'
  AND cc.is_primary = true;

-- Samira links
INSERT INTO capability_skills (capability_id, skill_id)
SELECT cc.id, s.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN skills s ON s.name IN ('Figma', 'UX Research', 'Prototyping')
WHERE u.clerk_user_id = 'test-candidate:samira-patel'
  AND cc.is_primary = true;

INSERT INTO capability_projects (capability_id, project_id)
SELECT cc.id, p.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN projects p ON p.user_id = u.id AND p.title = 'B2B Onboarding Redesign'
WHERE u.clerk_user_id = 'test-candidate:samira-patel'
  AND cc.is_primary = true;

-- Alex links
INSERT INTO capability_skills (capability_id, skill_id)
SELECT cc.id, s.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN skills s ON s.name IN ('TypeScript', 'System Design', 'Leadership')
WHERE u.clerk_user_id = 'test-candidate:alex-rivera'
  AND cc.is_primary = true;

INSERT INTO capability_projects (capability_id, project_id)
SELECT cc.id, p.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN projects p ON p.user_id = u.id
WHERE u.clerk_user_id = 'test-candidate:alex-rivera'
  AND cc.is_primary = true;

-- Education required for discovery completeness (all test candidates).
INSERT INTO education (user_id, institution, qualification, start_date, end_date, description)
SELECT id, 'University of Manchester', 'BSc Computer Science', '2014-09-01', '2018-06-01', 'First-class honours.'
FROM users WHERE clerk_user_id = 'test-candidate:maya-chen';

INSERT INTO education (user_id, institution, qualification, start_date, end_date, description)
SELECT id, 'London School of Economics', 'BSc Economics', '2016-09-01', '2019-06-01', NULL
FROM users WHERE clerk_user_id = 'test-candidate:jordan-okonkwo';

INSERT INTO education (user_id, institution, qualification, start_date, end_date, description)
SELECT id, 'University of the West of England', 'BA Graphic Design', '2015-09-01', '2018-06-01', NULL
FROM users WHERE clerk_user_id = 'test-candidate:samira-patel';

INSERT INTO education (user_id, institution, qualification, start_date, end_date, description)
SELECT id, 'University of Leeds', 'MEng Software Engineering', '2012-09-01', '2016-06-01', NULL
FROM users WHERE clerk_user_id = 'test-candidate:alex-rivera';

-- ---------------------------------------------------------------------------
-- Showcase profile: Riley Okafor — every Skill Profile field populated.
-- ---------------------------------------------------------------------------

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN (
  'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'API Design', 'System Design', 'Leadership'
)
WHERE u.clerk_user_id = 'test-candidate:riley-okafor'
ON CONFLICT DO NOTHING;

INSERT INTO projects (
  user_id, title, description, outcome, role, project_url, technologies, media, featured, sort_order
)
SELECT id,
  'Marketplace Checkout Rebuild',
  'Rebuilt multi-step checkout for a B2B marketplace with clearer error states and saved payment methods.',
  'Increased completed checkouts by 22% and reduced payment-support tickets by 40%.',
  'Lead Product Engineer',
  'https://example.com/case-studies/checkout-rebuild',
  '["TypeScript","React","Node.js","PostgreSQL"]'::jsonb,
  '[
    {"type":"link","url":"https://example.com/demo/checkout","label":"Interactive demo"},
    {"type":"link","url":"https://github.com/example/checkout","label":"Source overview"}
  ]'::jsonb,
  true,
  0
FROM users WHERE clerk_user_id = 'test-candidate:riley-okafor';

INSERT INTO projects (
  user_id, title, description, outcome, role, project_url, technologies, media, featured, sort_order
)
SELECT id,
  'Partner API Platform',
  'Designed and shipped a versioned partner API with docs, sandboxes, and usage metering.',
  'Onboarded 18 partners in six months without adding headcount to integrations.',
  'Staff Engineer',
  'https://example.com/case-studies/partner-api',
  '["Node.js","PostgreSQL","API Design"]'::jsonb,
  '[
    {"type":"link","url":"https://example.com/docs/partner-api","label":"API docs"}
  ]'::jsonb,
  false,
  1
FROM users WHERE clerk_user_id = 'test-candidate:riley-okafor';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, 'Ships customer-facing products end to end', true, 0
FROM users WHERE clerk_user_id = 'test-candidate:riley-okafor';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, label, false, sort_order
FROM users
CROSS JOIN (
  VALUES
    ('API Platform Design', 1),
    ('Cross-functional Delivery', 2),
    ('Product Mentorship', 3)
) AS caps(label, sort_order)
WHERE clerk_user_id = 'test-candidate:riley-okafor';

INSERT INTO capability_skills (capability_id, skill_id)
SELECT cc.id, s.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN skills s ON s.name IN ('TypeScript', 'React', 'Node.js', 'PostgreSQL')
WHERE u.clerk_user_id = 'test-candidate:riley-okafor'
  AND cc.is_primary = true;

INSERT INTO capability_projects (capability_id, project_id)
SELECT cc.id, p.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN projects p ON p.user_id = u.id
WHERE u.clerk_user_id = 'test-candidate:riley-okafor'
  AND cc.is_primary = true;

INSERT INTO capability_skills (capability_id, skill_id)
SELECT cc.id, s.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN skills s ON s.name IN ('API Design', 'Node.js', 'PostgreSQL')
WHERE u.clerk_user_id = 'test-candidate:riley-okafor'
  AND cc.label = 'API Platform Design';

INSERT INTO capability_projects (capability_id, project_id)
SELECT cc.id, p.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN projects p ON p.user_id = u.id AND p.title = 'Partner API Platform'
WHERE u.clerk_user_id = 'test-candidate:riley-okafor'
  AND cc.label = 'API Platform Design';

INSERT INTO education (user_id, institution, qualification, start_date, end_date, description)
SELECT id,
  'University of Edinburgh',
  'BEng Software Engineering',
  '2012-09-01',
  '2016-06-01',
  'Dissertation on distributed systems reliability.'
FROM users WHERE clerk_user_id = 'test-candidate:riley-okafor';

INSERT INTO education (user_id, institution, qualification, start_date, end_date, description)
SELECT id,
  'Edinburgh Napier University',
  'MSc Human-Computer Interaction',
  '2016-09-01',
  '2017-09-01',
  NULL
FROM users WHERE clerk_user_id = 'test-candidate:riley-okafor';

INSERT INTO employment_history (
  user_id, employer_name, job_title, start_date, end_date, currently_working, description
)
SELECT id,
  'Northwind Commerce',
  'Lead Product Engineer',
  '2021-03-01',
  NULL,
  true,
  'Owns checkout and post-purchase experiences for UK marketplace sellers.'
FROM users WHERE clerk_user_id = 'test-candidate:riley-okafor';

INSERT INTO employment_history (
  user_id, employer_name, job_title, start_date, end_date, currently_working, description
)
SELECT id,
  'Cascade Systems',
  'Senior Software Engineer',
  '2018-01-01',
  '2021-02-28',
  false,
  'Built partner integrations and internal tooling for ops teams.'
FROM users WHERE clerk_user_id = 'test-candidate:riley-okafor';

INSERT INTO qualifications (user_id, name, issuing_body, date_awarded, description)
SELECT id,
  'AWS Certified Developer – Associate',
  'Amazon Web Services',
  '2022-05-15',
  'Cloud fundamentals for product engineering teams.'
FROM users WHERE clerk_user_id = 'test-candidate:riley-okafor';

INSERT INTO qualifications (user_id, name, issuing_body, date_awarded, description)
SELECT id,
  'Professional Scrum Master I',
  'Scrum.org',
  '2020-11-01',
  NULL
FROM users WHERE clerk_user_id = 'test-candidate:riley-okafor';

INSERT INTO recommendations (
  user_id, author_name, relationship, public_summary, key_themes, body, verification_status
)
SELECT id,
  'Amelia Grant',
  'Former engineering manager',
  'Strong technical ownership, product thinking and mentoring ability across ambiguous delivery work.',
  '["Technical leadership","Product delivery","Collaboration"]'::jsonb,
  'Riley consistently turns ambiguous product goals into shipped outcomes. They raise the quality bar on APIs and frontend polish, and they mentor juniors without slowing delivery. Full private letter retained for controlled employer access.',
  'verified'
FROM users WHERE clerk_user_id = 'test-candidate:riley-okafor';

INSERT INTO recommendations (
  user_id, author_name, relationship, public_summary, key_themes, body, verification_status
)
SELECT id,
  'Jonah Blake',
  'Product design partner',
  'Constructive design partnership with clear customer-experience trade-offs and reliable delivery follow-through.',
  '["Collaboration","Product thinking"]'::jsonb,
  'One of the easiest engineers I have partnered with. Riley challenges design decisions constructively and always protects the customer experience in trade-offs.',
  'self_attested'
FROM users WHERE clerk_user_id = 'test-candidate:riley-okafor';
