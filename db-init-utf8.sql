CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE films (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rating numeric NOT NULL,
  director text NOT NULL,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  image text NOT NULL,
  cover text NOT NULL,
  title text NOT NULL,
  about text NOT NULL,
  description text NOT NULL
);

CREATE TABLE schedules (
  id text PRIMARY KEY,
  film_id uuid NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  daytime timestamptz NOT NULL,
  hall integer NOT NULL,
  rows integer NOT NULL,
  seats integer NOT NULL,
  price integer NOT NULL,
  taken text[] NOT NULL DEFAULT ARRAY[]::text[]
);

INSERT INTO films (id, rating, director, tags, image, cover, title, about, description) VALUES
('11111111-1111-1111-1111-111111111111', 7.4, 'Director One', ARRAY['drama', 'comedy'], '/images/film-1.jpg', '/images/film-1-cover.jpg', 'Film One', 'First film.', 'Interesting film about cinema.'),
('22222222-2222-2222-2222-222222222222', 8.1, 'Director Two', ARRAY['action', 'adventure'], '/images/film-2.jpg', '/images/film-2-cover.jpg', 'Film Two', 'Second film.', 'Story of adventure.');

INSERT INTO schedules (id, film_id, daytime, hall, rows, seats, price, taken) VALUES
('session-1', '11111111-1111-1111-1111-111111111111', '2026-06-10T14:00:00Z', 1, 10, 15, 400, ARRAY['1:1','1:2']),
('session-2', '11111111-1111-1111-1111-111111111111', '2026-06-10T18:00:00Z', 1, 10, 15, 450, ARRAY[]::text[]),
('session-3', '22222222-2222-2222-2222-222222222222', '2026-06-11T20:00:00Z', 2, 8, 12, 500, ARRAY['3:5']);
