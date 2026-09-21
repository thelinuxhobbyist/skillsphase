-- Remove seeded demo candidates (clerk_user_id prefix test-candidate:).
-- Safe to re-run. Cascades cover most child tables; explicit deletes avoid
-- ordering issues where FK rules differ.

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

DELETE FROM applications
WHERE user_id IN (
  SELECT id FROM users WHERE clerk_user_id LIKE 'test-candidate:%'
);

DELETE FROM messages
WHERE contact_id IN (
  SELECT c.id FROM contacts c
  JOIN users u ON u.id = c.candidate_user_id
  WHERE u.clerk_user_id LIKE 'test-candidate:%'
)
OR sender_user_id IN (
  SELECT id FROM users WHERE clerk_user_id LIKE 'test-candidate:%'
);

DELETE FROM contacts
WHERE candidate_user_id IN (
  SELECT id FROM users WHERE clerk_user_id LIKE 'test-candidate:%'
);

DELETE FROM saved_candidates
WHERE candidate_user_id IN (
  SELECT id FROM users WHERE clerk_user_id LIKE 'test-candidate:%'
);

DELETE FROM candidate_reviews
WHERE candidate_user_id IN (
  SELECT id FROM users WHERE clerk_user_id LIKE 'test-candidate:%'
);

DELETE FROM users
WHERE clerk_user_id LIKE 'test-candidate:%';
