-- users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- research_papers table
CREATE TABLE IF NOT EXISTS research_papers (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  authors TEXT[] NOT NULL,
  abstract TEXT NOT NULL,
  file_name VARCHAR(100) NOT NULL,
  file_path VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);