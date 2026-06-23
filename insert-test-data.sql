-- Insert test films into the afisha database
-- Execute this after init-cloud.sql

INSERT INTO films (id, rating, director, tags, image, cover, title, about, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 8.5, 'Christopher Nolan', ARRAY['Action', 'Sci-Fi'], '/images/bg1s.jpg', '/images/bg1c.jpg', 'Inception', 'A thief who steals corporate secrets through dream-sharing technology', 'Dom Cobb is a skilled thief who specializes in extraction, stealing valuable secrets from deep within the subconscious of his targets while they dream.'),
('550e8400-e29b-41d4-a716-446655440002', 9.0, 'Francis Ford Coppola', ARRAY['Crime', 'Drama'], '/images/bg2s.jpg', '/images/bg2c.jpg', 'The Godfather', 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son', 'The film presents an epic saga of power, family loyalty, and betrayal in post-WWII America.'),
('550e8400-e29b-41d4-a716-446655440003', 8.9, 'Steven Spielberg', ARRAY['Drama', 'War'], '/images/bg3s.jpg', '/images/bg3c.jpg', 'Saving Private Ryan', 'Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper', 'Epic war drama that follows soldiers on their perilous mission through World War II.');

-- Insert test film schedules
INSERT INTO schedules (id, daytime, hall, rows, seats, price, taken, film_id) VALUES
('650e8400-e29b-41d4-a716-446655440001', '2026-06-23 10:00:00+03:00', 1, 10, 15, 350.00, ARRAY[]::text[], '550e8400-e29b-41d4-a716-446655440001'),
('650e8400-e29b-41d4-a716-446655440002', '2026-06-23 14:00:00+03:00', 2, 10, 15, 400.00, ARRAY[]::text[], '550e8400-e29b-41d4-a716-446655440001'),
('650e8400-e29b-41d4-a716-446655440003', '2026-06-23 18:00:00+03:00', 1, 10, 15, 450.00, ARRAY[]::text[], '550e8400-e29b-41d4-a716-446655440002'),
('650e8400-e29b-41d4-a716-446655440004', '2026-06-23 20:30:00+03:00', 2, 10, 15, 500.00, ARRAY[]::text[], '550e8400-e29b-41d4-a716-446655440003');
