-- Launch homepage defaults: hide optional marketing sections by default.
UPDATE homepage_sections
SET enabled = false, updated_at = now()
WHERE type IN ('trust', 'businesses_cta', 'faq', 'stats', 'testimonials');

UPDATE homepage_sections
SET enabled = true, updated_at = now()
WHERE type = 'featured_candidates';

-- Populate example skill profiles when the section has no demo cards yet.
UPDATE homepage_sections
SET
  content = jsonb_set(
    content,
    '{demoCards}',
    '[
      {"title":"Alex M.","skills":["React","TypeScript","Node.js"],"yearsExperience":6,"topProject":"Led rebuild of a customer portal serving 40k users","availability":"immediate"},
      {"title":"Sam T.","skills":["Data analysis","Python","SQL"],"yearsExperience":4,"topProject":"Built reporting dashboards for a retail operations team","availability":"within_one_month"},
      {"title":"Jordan K.","skills":["UX research","Figma","Service design"],"yearsExperience":8,"topProject":"Redesigned onboarding flow, cutting drop-off by 28%","availability":"freelance"}
    ]'::jsonb,
    true
  ),
  updated_at = now()
WHERE type = 'featured_candidates'
  AND coalesce(jsonb_array_length(content->'demoCards'), 0) = 0;
