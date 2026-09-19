import { Pool } from "pg";
import dotenv from "dotenv"; // to load environment variables

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// one-time connectivity check at startup, restrict new connection triggering on every request
pool
  .connect()
  .then((client) => {
    console.log("Connection pool established with the DB, ready to serve!");
    client.release();
  })
  .catch((err) => {
    console.error(`Failed to connect to the DB: ${err}`);
  });

// when pool detects the error with the DB connection
pool.on("error", (err) => {
  console.error(`Database error: ${err}`);
});

export default pool;
