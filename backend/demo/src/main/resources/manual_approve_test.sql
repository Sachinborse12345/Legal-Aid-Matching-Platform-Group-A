-- Manually approve some directory entries for testing
-- This will make them visible in the citizen dashboard

-- Approve the first 5 lawyers
UPDATE directory_entries 
SET approved = true 
WHERE type = 'LAWYER' 
AND source IN ('BAR_COUNCIL', 'USER_REGISTRATION')
LIMIT 5;

-- Approve the first 5 NGOs  
UPDATE directory_entries 
SET approved = true 
WHERE type = 'NGO'
AND source IN ('NGO_DARPAN', 'USER_REGISTRATION')
LIMIT 5;

-- Check what we approved
SELECT id, type, name, source, approved, verified 
FROM directory_entries 
WHERE approved = true
ORDER BY type, name;
