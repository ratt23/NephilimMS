import postgres from 'postgres';

// Netlify Dev automatically loads .env variables, so we don't need dotenv here.
const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export default sql;
