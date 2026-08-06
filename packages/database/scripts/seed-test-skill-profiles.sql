-- Idempotent seed for public SkillsPhase profiles (ADR 002).
-- Profession-diverse demos: capability before title, evidence by profession.
-- Identified by clerk_user_id prefix test-candidate: for easy cleanup.

-- Remove previous demo candidates entirely, then recreate.
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

DELETE FROM users
WHERE clerk_user_id LIKE 'test-candidate:%';

INSERT INTO skills (name) VALUES
  ('Lesson planning'),
  ('Assessment design'),
  ('Classroom leadership'),
  ('Safeguarding'),
  ('Commercial installs'),
  ('Electrical testing'),
  ('Fault diagnosis'),
  ('Health & safety'),
  ('Brand identity'),
  ('Visual design'),
  ('Client briefing'),
  ('Typography'),
  ('Menu design'),
  ('Food costing'),
  ('Kitchen leadership'),
  ('Food hygiene'),
  ('Programme delivery'),
  ('Stakeholder management'),
  ('Risk management'),
  ('Budget control'),
  ('TypeScript'),
  ('React'),
  ('Node.js'),
  ('System design')
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
  'test-candidate:priya-rahman',
  'job_seeker',
  'test.priya.rahman@example.com',
  'Priya',
  'Rahman',
  'Leeds',
  'GB',
  'Secondary Teacher',
  'Helps GCSE students improve confidence and exam performance',
  'Helps GCSE students improve confidence and exam performance through structured lesson plans, clear assessment, and calm classroom leadership. Full DBS check available upon request.',
  'on_site',
  'within_one_month',
  9,
  true
),
(
  'test-candidate:jordan-mills',
  'job_seeker',
  'test.jordan.mills@example.com',
  'Jordan',
  'Mills',
  'Birmingham',
  'GB',
  'Electrician',
  'Installs and maintains safe commercial electrical systems',
  'Installs and maintains safe commercial electrical systems for offices, retail units, and light industrial sites. Qualifications and certificates available upon request.',
  'on_site',
  'immediate',
  11,
  true
),
(
  'test-candidate:aisha-lane',
  'job_seeker',
  'test.aisha.lane@example.com',
  'Aisha',
  'Lane',
  'Bristol',
  'GB',
  'Graphic Designer',
  'Creates memorable brands that help businesses stand out',
  'Creates memorable brands that help businesses stand out — from identity systems to launch campaigns. Portfolio and client references available upon request.',
  'hybrid',
  'freelance',
  7,
  true
),
(
  'test-candidate:sam-okonkwo',
  'job_seeker',
  'test.sam.okonkwo@example.com',
  'Sam',
  'Okonkwo',
  'Manchester',
  'GB',
  'Chef',
  'Designs seasonal menus that keep guests coming back',
  'Designs seasonal menus that keep guests coming back, balancing flavour, cost control, and kitchen flow. Food hygiene certificates available upon request.',
  'on_site',
  'immediate',
  8,
  true
),
(
  'test-candidate:morgan-ellis',
  'job_seeker',
  'test.morgan.ellis@example.com',
  'Morgan',
  'Ellis',
  'London',
  'GB',
  'Project Manager',
  'Delivers complex programmes on time for public-sector teams',
  'Delivers complex programmes on time for public-sector teams, keeping stakeholders aligned and risks visible. References available upon request.',
  'hybrid',
  'permanent',
  10,
  true
),
(
  'test-candidate:casey-nguyen',
  'job_seeker',
  'test.casey.nguyen@example.com',
  'Casey',
  'Nguyen',
  'Edinburgh',
  'GB',
  'Software Engineer',
  'Builds reliable platforms that help teams deliver software faster',
  'Builds reliable platforms that help engineering teams deliver software faster. Technical case studies and references available upon request.',
  'remote',
  'within_one_month',
  6,
  true
);

-- Showcase contact + rate fields for the teacher profile.
UPDATE users SET
  phone_number = '+44 7700 900221',
  salary_min = 38000,
  salary_max = 46000,
  salary_currency = 'GBP',
  updated_at = now()
WHERE clerk_user_id = 'test-candidate:priya-rahman';

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN ('Lesson planning', 'Assessment design', 'Classroom leadership', 'Safeguarding')
WHERE u.clerk_user_id = 'test-candidate:priya-rahman'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN ('Commercial installs', 'Electrical testing', 'Fault diagnosis', 'Health & safety')
WHERE u.clerk_user_id = 'test-candidate:jordan-mills'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN ('Brand identity', 'Visual design', 'Client briefing', 'Typography')
WHERE u.clerk_user_id = 'test-candidate:aisha-lane'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN ('Menu design', 'Food costing', 'Kitchen leadership', 'Food hygiene')
WHERE u.clerk_user_id = 'test-candidate:sam-okonkwo'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN ('Programme delivery', 'Stakeholder management', 'Risk management', 'Budget control')
WHERE u.clerk_user_id = 'test-candidate:morgan-ellis'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id)
SELECT u.id, s.id
FROM users u
JOIN skills s ON s.name IN ('TypeScript', 'React', 'Node.js', 'System design')
WHERE u.clerk_user_id = 'test-candidate:casey-nguyen'
ON CONFLICT DO NOTHING;

-- Evidence projects (profession-specific)
INSERT INTO projects (user_id, title, description, outcome, role, project_url, technologies, featured, sort_order)
SELECT id,
  'GCSE Confidence Intervention',
  'Eight-week booster programme with clear learning objectives, retrieval practice, and parent progress notes.',
  'Raised cohort pass rate from 62% to 84% over two years.',
  'Subject lead',
  NULL,
  '["Lesson planning","Assessment design"]'::jsonb,
  true,
  0
FROM users WHERE clerk_user_id = 'test-candidate:priya-rahman';

INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Classroom Resource Pack — Algebra',
  'Reusable worksheets, worked examples, and exit tickets shared across the department.',
  'Cut planning prep time for three colleagues by roughly a day each half-term.',
  'Teacher',
  '["Lesson planning"]'::jsonb,
  false,
  1
FROM users WHERE clerk_user_id = 'test-candidate:priya-rahman';

INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Retail Unit Rewire',
  'Full commercial rewire for a high-street retail fit-out, including testing certificates and handover pack.',
  'Completed ahead of soft-opening with zero snagging on electricals.',
  'Lead electrician',
  '["Commercial installs","Electrical testing"]'::jsonb,
  true,
  0
FROM users WHERE clerk_user_id = 'test-candidate:jordan-mills';

INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Office Lighting Upgrade',
  'LED conversion and emergency lighting upgrade for a three-floor office block.',
  'Cut energy use on lighting by an estimated 35% while meeting current regs.',
  'Electrician',
  '["Commercial installs","Health & safety"]'::jsonb,
  false,
  1
FROM users WHERE clerk_user_id = 'test-candidate:jordan-mills';

INSERT INTO projects (user_id, title, description, outcome, role, project_url, technologies, featured, sort_order)
SELECT id,
  'Harbour Bakery Rebrand',
  'Full brand identity, packaging system, and launch assets for an independent bakery.',
  'Owner reported a 40% increase in wholesale enquiries in the first quarter.',
  'Lead designer',
  'https://example.com/portfolio/harbour-bakery',
  '["Brand identity","Typography"]'::jsonb,
  true,
  0
FROM users WHERE clerk_user_id = 'test-candidate:aisha-lane';

INSERT INTO projects (user_id, title, description, outcome, role, project_url, technologies, featured, sort_order)
SELECT id,
  'Trade Services Website',
  'Visual identity and marketing site for a multi-trade contractor.',
  'Improved quote request conversion from roughly 2% to 6% of visits.',
  'Designer',
  'https://example.com/portfolio/trade-services',
  '["Visual design","Client briefing"]'::jsonb,
  false,
  1
FROM users WHERE clerk_user_id = 'test-candidate:aisha-lane';

INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Autumn Guest Menu',
  'Seasonal tasting menu with local suppliers, allergen mapping, and kitchen prep guides.',
  'Repeat guest bookings rose 25% across the season.',
  'Head chef',
  '["Menu design","Food costing"]'::jsonb,
  true,
  0
FROM users WHERE clerk_user_id = 'test-candidate:sam-okonkwo';

INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Service Efficiency Reset',
  'Reworked station layout and prep lists for a 60-cover dining room.',
  'Reduced average ticket time by 4 minutes on Friday service.',
  'Sous chef',
  '["Kitchen leadership","Food hygiene"]'::jsonb,
  false,
  1
FROM users WHERE clerk_user_id = 'test-candidate:sam-okonkwo';

INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Council Digital Services Programme',
  'Coordinated delivery across five suppliers for a resident-facing services rollout.',
  'Launched on the agreed public date with contingency unused.',
  'Programme manager',
  '["Programme delivery","Stakeholder management"]'::jsonb,
  true,
  0
FROM users WHERE clerk_user_id = 'test-candidate:morgan-ellis';

INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Office Relocation Programme',
  'End-to-end relocation for a 220-person team, including risk registers and vendor control.',
  'Zero lost working days during cutover weekend.',
  'Project manager',
  '["Risk management","Budget control"]'::jsonb,
  false,
  1
FROM users WHERE clerk_user_id = 'test-candidate:morgan-ellis';

INSERT INTO projects (user_id, title, description, outcome, role, project_url, technologies, featured, sort_order)
SELECT id,
  'Internal Developer Portal',
  'Self-serve templates and golden paths so product teams can launch services safely.',
  'Cut average service bootstrap time from five days to one.',
  'Platform engineer',
  'https://example.com/case-studies/dev-portal',
  '["TypeScript","Node.js","System design"]'::jsonb,
  true,
  0
FROM users WHERE clerk_user_id = 'test-candidate:casey-nguyen';

INSERT INTO projects (user_id, title, description, outcome, role, technologies, featured, sort_order)
SELECT id,
  'Checkout Reliability Programme',
  'Stabilised payment flows and observability for a high-traffic retail checkout.',
  'Reduced payment-related support tickets by 40%.',
  'Software engineer',
  '["React","TypeScript","Node.js"]'::jsonb,
  false,
  1
FROM users WHERE clerk_user_id = 'test-candidate:casey-nguyen';

-- Capabilities
INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, 'Helps GCSE students improve confidence and exam performance', true, 0
FROM users WHERE clerk_user_id = 'test-candidate:priya-rahman';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, label, false, sort_order
FROM users
CROSS JOIN (
  VALUES
    ('Designs clear assessment pathways', 1),
    ('Builds calm, focused classrooms', 2),
    ('Supports colleagues with shared resources', 3)
) AS caps(label, sort_order)
WHERE clerk_user_id = 'test-candidate:priya-rahman';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, 'Installs and maintains safe commercial electrical systems', true, 0
FROM users WHERE clerk_user_id = 'test-candidate:jordan-mills';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, label, false, sort_order
FROM users
CROSS JOIN (
  VALUES
    ('Diagnoses faults quickly on live sites', 1),
    ('Delivers clean handover packs and certificates', 2)
) AS caps(label, sort_order)
WHERE clerk_user_id = 'test-candidate:jordan-mills';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, 'Creates memorable brands that help businesses stand out', true, 0
FROM users WHERE clerk_user_id = 'test-candidate:aisha-lane';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, label, false, sort_order
FROM users
CROSS JOIN (
  VALUES
    ('Turns briefs into coherent visual systems', 1),
    ('Designs launch assets that convert interest', 2)
) AS caps(label, sort_order)
WHERE clerk_user_id = 'test-candidate:aisha-lane';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, 'Designs seasonal menus that keep guests coming back', true, 0
FROM users WHERE clerk_user_id = 'test-candidate:sam-okonkwo';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, label, false, sort_order
FROM users
CROSS JOIN (
  VALUES
    ('Controls food cost without dulling the plate', 1),
    ('Leads calm, organised kitchen service', 2)
) AS caps(label, sort_order)
WHERE clerk_user_id = 'test-candidate:sam-okonkwo';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, 'Delivers complex programmes on time for public-sector teams', true, 0
FROM users WHERE clerk_user_id = 'test-candidate:morgan-ellis';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, label, false, sort_order
FROM users
CROSS JOIN (
  VALUES
    ('Keeps stakeholders aligned under pressure', 1),
    ('Surfaces risk early enough to act', 2)
) AS caps(label, sort_order)
WHERE clerk_user_id = 'test-candidate:morgan-ellis';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, 'Builds reliable platforms that help teams deliver software faster', true, 0
FROM users WHERE clerk_user_id = 'test-candidate:casey-nguyen';

INSERT INTO candidate_capabilities (user_id, label, is_primary, sort_order)
SELECT id, label, false, sort_order
FROM users
CROSS JOIN (
  VALUES
    ('Stabilises critical customer journeys', 1),
    ('Documents platforms so teams can self-serve', 2)
) AS caps(label, sort_order)
WHERE clerk_user_id = 'test-candidate:casey-nguyen';

-- Link primary capabilities to skills + evidence
INSERT INTO capability_skills (capability_id, skill_id)
SELECT cc.id, s.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN skills s ON s.name IN ('Lesson planning', 'Assessment design', 'Classroom leadership')
WHERE u.clerk_user_id = 'test-candidate:priya-rahman' AND cc.is_primary = true;

INSERT INTO capability_projects (capability_id, project_id)
SELECT cc.id, p.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN projects p ON p.user_id = u.id
WHERE u.clerk_user_id = 'test-candidate:priya-rahman' AND cc.is_primary = true;

INSERT INTO capability_skills (capability_id, skill_id)
SELECT cc.id, s.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN skills s ON s.name IN ('Commercial installs', 'Electrical testing', 'Health & safety')
WHERE u.clerk_user_id = 'test-candidate:jordan-mills' AND cc.is_primary = true;

INSERT INTO capability_projects (capability_id, project_id)
SELECT cc.id, p.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN projects p ON p.user_id = u.id
WHERE u.clerk_user_id = 'test-candidate:jordan-mills' AND cc.is_primary = true;

INSERT INTO capability_skills (capability_id, skill_id)
SELECT cc.id, s.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN skills s ON s.name IN ('Brand identity', 'Visual design', 'Typography')
WHERE u.clerk_user_id = 'test-candidate:aisha-lane' AND cc.is_primary = true;

INSERT INTO capability_projects (capability_id, project_id)
SELECT cc.id, p.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN projects p ON p.user_id = u.id
WHERE u.clerk_user_id = 'test-candidate:aisha-lane' AND cc.is_primary = true;

INSERT INTO capability_skills (capability_id, skill_id)
SELECT cc.id, s.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN skills s ON s.name IN ('Menu design', 'Food costing', 'Kitchen leadership')
WHERE u.clerk_user_id = 'test-candidate:sam-okonkwo' AND cc.is_primary = true;

INSERT INTO capability_projects (capability_id, project_id)
SELECT cc.id, p.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN projects p ON p.user_id = u.id
WHERE u.clerk_user_id = 'test-candidate:sam-okonkwo' AND cc.is_primary = true;

INSERT INTO capability_skills (capability_id, skill_id)
SELECT cc.id, s.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN skills s ON s.name IN ('Programme delivery', 'Stakeholder management', 'Risk management')
WHERE u.clerk_user_id = 'test-candidate:morgan-ellis' AND cc.is_primary = true;

INSERT INTO capability_projects (capability_id, project_id)
SELECT cc.id, p.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN projects p ON p.user_id = u.id
WHERE u.clerk_user_id = 'test-candidate:morgan-ellis' AND cc.is_primary = true;

INSERT INTO capability_skills (capability_id, skill_id)
SELECT cc.id, s.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN skills s ON s.name IN ('TypeScript', 'React', 'System design')
WHERE u.clerk_user_id = 'test-candidate:casey-nguyen' AND cc.is_primary = true;

INSERT INTO capability_projects (capability_id, project_id)
SELECT cc.id, p.id
FROM candidate_capabilities cc
JOIN users u ON u.id = cc.user_id
JOIN projects p ON p.user_id = u.id
WHERE u.clerk_user_id = 'test-candidate:casey-nguyen' AND cc.is_primary = true;

-- Education (required for profile completeness)
INSERT INTO education (user_id, institution, qualification, start_date, end_date, description)
SELECT id, 'University of Leeds', 'BA Education Studies', '2012-09-01', '2015-06-01', 'QTS completed via SCITT.'
FROM users WHERE clerk_user_id = 'test-candidate:priya-rahman';

INSERT INTO education (user_id, institution, qualification, start_date, end_date, description)
SELECT id, 'City College Birmingham', 'City & Guilds Level 3 Electrical Installation', '2010-09-01', '2012-06-01', NULL
FROM users WHERE clerk_user_id = 'test-candidate:jordan-mills';

INSERT INTO education (user_id, institution, qualification, start_date, end_date, description)
SELECT id, 'University of the West of England', 'BA Graphic Design', '2014-09-01', '2017-06-01', NULL
FROM users WHERE clerk_user_id = 'test-candidate:aisha-lane';

INSERT INTO education (user_id, institution, qualification, start_date, end_date, description)
SELECT id, 'Manchester Catering College', 'Professional Cookery Diploma', '2013-09-01', '2015-06-01', NULL
FROM users WHERE clerk_user_id = 'test-candidate:sam-okonkwo';

INSERT INTO education (user_id, institution, qualification, start_date, end_date, description)
SELECT id, 'University of Manchester', 'BSc Management', '2009-09-01', '2012-06-01', NULL
FROM users WHERE clerk_user_id = 'test-candidate:morgan-ellis';

INSERT INTO education (user_id, institution, qualification, start_date, end_date, description)
SELECT id, 'University of Edinburgh', 'BSc Computer Science', '2015-09-01', '2019-06-01', NULL
FROM users WHERE clerk_user_id = 'test-candidate:casey-nguyen';

-- Showcase extras for Priya (progressive trust)
INSERT INTO employment_history (
  user_id, employer_name, job_title, start_date, end_date, currently_working, description
)
SELECT id,
  'West Riding Academy',
  'Secondary Maths Teacher',
  '2018-09-01',
  NULL,
  true,
  'Teaches GCSE maths and leads a department confidence intervention.'
FROM users WHERE clerk_user_id = 'test-candidate:priya-rahman';

INSERT INTO qualifications (user_id, name, issuing_body, date_awarded, description)
SELECT id,
  'DBS Check (Enhanced)',
  'Disclosure and Barring Service',
  '2025-01-12',
  'Full certificate available upon request.'
FROM users WHERE clerk_user_id = 'test-candidate:priya-rahman';

INSERT INTO qualifications (user_id, name, issuing_body, date_awarded, description)
SELECT id,
  'Qualified Teacher Status',
  'Department for Education',
  '2016-07-01',
  'Certificate available upon request.'
FROM users WHERE clerk_user_id = 'test-candidate:priya-rahman';

INSERT INTO recommendations (
  user_id, author_name, relationship, public_summary, key_themes, body, verification_status
)
SELECT id,
  'Helen Shaw',
  'Head of department',
  'Calm classroom leadership with measurable improvement in student confidence and outcomes.',
  '["Student outcomes","Classroom leadership","Collaboration"]'::jsonb,
  'Priya turns anxious GCSE groups into confident exam candidates. Full private reference available upon request.',
  'verified'
FROM users WHERE clerk_user_id = 'test-candidate:priya-rahman';

INSERT INTO recommendations (
  user_id, author_name, relationship, public_summary, key_themes, body, verification_status
)
SELECT id,
  'Parent governor panel',
  'Parent feedback summary',
  'Parents regularly note clearer progress updates and stronger exam confidence.',
  '["Communication","Student confidence"]'::jsonb,
  'Collected parent feedback summaries retained for controlled employer access.',
  'self_attested'
FROM users WHERE clerk_user_id = 'test-candidate:priya-rahman';

INSERT INTO qualifications (user_id, name, issuing_body, date_awarded, description)
SELECT id,
  '18th Edition Wiring Regulations',
  'City & Guilds',
  '2023-04-20',
  'Certificate available upon request.'
FROM users WHERE clerk_user_id = 'test-candidate:jordan-mills';

INSERT INTO qualifications (user_id, name, issuing_body, date_awarded, description)
SELECT id,
  'Level 2 Food Hygiene',
  'Highfield',
  '2024-09-01',
  'Certificate available upon request.'
FROM users WHERE clerk_user_id = 'test-candidate:sam-okonkwo';
