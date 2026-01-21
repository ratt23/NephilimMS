
import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export async function handler(event, context) {
    try {
        const settingsCount = await sql`SELECT COUNT(*) FROM settings`;
        const appSettingsCount = await sql`SELECT COUNT(*) FROM app_settings`;

        let settingsSample = [];
        if (settingsCount[0].count > 0) {
            settingsSample = await sql`SELECT * FROM settings LIMIT 5`;
        }

        let appSettingsSample = [];
        if (appSettingsCount[0].count > 0) {
            appSettingsSample = await sql`SELECT * FROM app_settings LIMIT 5`;
        }

        const doctorsSample = await sql`SELECT name, specialty FROM doctors LIMIT 5`;

        return {
            statusCode: 200,
            body: JSON.stringify({
                settings: { count: settingsCount[0].count, sample: settingsSample },
                app_settings: { count: appSettingsCount[0].count, sample: appSettingsSample },
                doctors: doctorsSample
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
