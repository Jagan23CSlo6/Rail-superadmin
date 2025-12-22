const { Pool } = require("pg");

// Allow DB credentials to come from environment variables so they can be set per-machine.
const {
  DATABASE_URL,
  DB_HOST = "13.126.209.246",
  DB_PORT = 5432,
  DB_USER = "postgres",
  DB_PASSWORD = "1234",
  DB_NAME = "railway",
} = process.env;

// Fail fast with a clear error if no password is provided when using discrete DB_* vars.
if (!DATABASE_URL && (!DB_PASSWORD || DB_PASSWORD.length === 0)) {
  throw new Error(
    "Database password is missing. Set DB_PASSWORD (or DATABASE_URL) in your environment before starting the server."
  );
}

const pool = DATABASE_URL
  ? new Pool({ connectionString: DATABASE_URL })
  : new Pool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: String(DB_PASSWORD),
      database: DB_NAME,
    });

// Test connection
pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

module.exports = pool;