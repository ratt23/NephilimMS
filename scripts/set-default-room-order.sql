-- Set default sort order for Tarif Kamar items
-- Order: Kelas 3, Kelas 2, Kelas 1, VIP, VVIP

-- First, update based on title matching
UPDATE catalog_items 
SET sort_order = CASE 
    WHEN LOWER(title) LIKE '%kelas 3%' OR LOWER(title) LIKE '%kelas iii%' THEN 0
    WHEN LOWER(title) LIKE '%kelas 2%' OR LOWER(title) LIKE '%kelas ii%' THEN 1
    WHEN LOWER(title) LIKE '%kelas 1%' OR LOWER(title) LIKE '%kelas i%' AND NOT LOWER(title) LIKE '%kelas ii%' THEN 2
    WHEN LOWER(title) LIKE '%vip%' AND NOT LOWER(title) LIKE '%vvip%' THEN 3
    WHEN LOWER(title) LIKE '%vvip%' THEN 4
    ELSE sort_order
END
WHERE category = 'tarif-kamar';

-- For any items that don't match, put them at the end
UPDATE catalog_items 
SET sort_order = 99
WHERE category = 'tarif-kamar' 
AND sort_order IS NULL;
