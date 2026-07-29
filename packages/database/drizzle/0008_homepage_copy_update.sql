-- Skills-first homepage copy refresh (hero, steps, and gap-neutral messaging).
UPDATE homepage_sections
SET
  content = jsonb_set(
    content,
    '{body}',
    '"People should be hired for what they can do today—not whether their career followed a straight line. Build a profile around your skills, experience, certifications, and real evidence of your work."'::jsonb,
    true
  ),
  updated_at = now()
WHERE type = 'hero';

UPDATE homepage_sections
SET
  content = content
    - 'subtitle'
    || jsonb_build_object(
      'title',
      'Three simple steps from profile to conversation.',
      'steps',
      '[
        {
          "title": "Build your skills-first profile",
          "body": "Show what you can do today. Add your skills, experience, certifications, and projects, supported by real portfolio evidence instead of a generic personal statement."
        },
        {
          "title": "Get discovered",
          "body": "Verified businesses search for people by skills and experience—not career timelines. When your profile fits what they''re looking for, they can view your work and learn more about your capabilities."
        },
        {
          "title": "Start the conversation",
          "body": "There is no automatic matching. Businesses decide who they want to contact based on your skills and evidence of your work. You choose whether to continue the conversation."
        }
      ]'::jsonb
    ),
  updated_at = now()
WHERE type = 'how_it_works';

UPDATE homepage_sections
SET
  content = jsonb_set(
    content,
    '{items,0,body}',
    '"Employers see what you can do today — skills, experience, and real evidence of your work. The path you took to get here matters less than what you can deliver now."'::jsonb,
    true
  ),
  updated_at = now()
WHERE type = 'differentiators';

UPDATE homepage_sections
SET
  content = jsonb_set(
    content,
    '{items,1}',
    '"Evidence over timelines"'::jsonb,
    true
  ),
  updated_at = now()
WHERE type = 'trust';

UPDATE homepage_sections
SET
  content = jsonb_set(
    content,
    '{items,0}',
    jsonb_build_object(
      'q',
      'Who is SkillsPhase for?',
      'a',
      'Anyone who wants to be hired for what they can do today. Your profile leads with skills, experience, certifications, and portfolio evidence — not whether your career followed a straight line.'
    ),
    true
  ),
  updated_at = now()
WHERE type = 'faq';
