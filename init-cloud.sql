-- Initialize database and tables for Yandex Cloud deployment
-- Execute this as superuser (postgres)

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS afisha OWNER exampleuser;

-- Connect to afisha database and create tables
\c afisha;

-- Create films table
CREATE TABLE IF NOT EXISTS films (
  id VARCHAR PRIMARY KEY,
  rating FLOAT NOT NULL,
  director VARCHAR NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::text[],
  image VARCHAR NOT NULL,
  cover VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  about VARCHAR NOT NULL,
  description VARCHAR NOT NULL
);

-- Create schedules table (film_schedule)
CREATE TABLE IF NOT EXISTS schedules (
  id VARCHAR PRIMARY KEY,
  daytime TIMESTAMPTZ NOT NULL,
  hall INTEGER NOT NULL,
  rows INTEGER NOT NULL,
  seats INTEGER NOT NULL,
  price FLOAT NOT NULL,
  taken TEXT[] DEFAULT ARRAY[]::text[],
  film_id VARCHAR NOT NULL REFERENCES films(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedules_film_id ON schedules(film_id);

-- Grant permissions to exampleuser
GRANT ALL PRIVILEGES ON DATABASE afisha TO exampleuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO exampleuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO exampleuser;
