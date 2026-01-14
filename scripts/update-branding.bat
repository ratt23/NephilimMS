@echo off
REM Quick database update script for hospital_name
echo Updating hospital_name in database...

node -e "const {sql} = require('@vercel/postgres'); require('dotenv').config(); (async () => { try { const result = await sql`UPDATE settings SET value = 'RSU Siloam Ambon' WHERE key = 'hospital_name'`; console.log('✓ Updated hospital_name'); const check = await sql`SELECT key, value FROM settings WHERE key = 'hospital_name'`; console.log('Current value:', check.rows[0]); } catch(e) { console.error('Error:', e.message); } process.exit(0); })();"

echo.
echo Done! Refresh eCatalog to see changes.
pause
