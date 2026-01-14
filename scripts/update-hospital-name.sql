-- Update hospital_name in settings table
UPDATE settings 
SET value = 'RSU Siloam Ambon'
WHERE key = 'hospital_name';

-- Verify the update
SELECT key, value 
FROM settings 
WHERE key = 'hospital_name';
