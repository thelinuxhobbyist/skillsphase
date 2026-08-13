-- Homepage copy: keep "Skills first. Because life happens." and deepen the
-- phases philosophy without framing SkillsPhase as a career-gap product.
UPDATE homepage_sections
SET
  content = content || jsonb_build_object(
    'title', 'Skills first. Because life happens.',
    'titleAccent', 'Because life happens',
    'tagline', 'Work changes. Life changes. Your skills don''t disappear.',
    'body', 'Build a profile around what you can do, the evidence behind it, and the impact you''ve made — then use it to apply for jobs.',
    'primaryCtaLabel', 'Create your SkillsPhase profile',
    'primaryCtaHref', '/register?as=candidate',
    'secondaryCtaLabel', 'Discover talent',
    'secondaryCtaHref', '/discover-talent'
  ),
  updated_at = now()
WHERE type = 'hero';

UPDATE homepage_sections
SET
  content = content || jsonb_build_object(
    'title', 'Your skills don''t stop when work does.',
    'subtitle', 'Skills can come from employment, training, caring, volunteering, building something yourself, or simply continuing to learn.',
    'body', 'Traditional CVs see gaps. SkillsPhase sees capability.'
  ),
  updated_at = now()
WHERE type = 'career_journeys';
