-- Создание таблиц для проекта Film!
-- Связь один фильм -> много сеансов (one-to-many)

DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS films;

CREATE TABLE films (
    id varchar PRIMARY KEY,
    rating real NOT NULL DEFAULT 0,
    director varchar NOT NULL DEFAULT '',
    tags varchar[] NOT NULL DEFAULT '{}',
    image varchar NOT NULL DEFAULT '',
    cover varchar NOT NULL DEFAULT '',
    title varchar NOT NULL DEFAULT '',
    about text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT ''
);

CREATE TABLE schedules (
    id varchar PRIMARY KEY,
    "filmId" varchar NOT NULL REFERENCES films(id) ON DELETE CASCADE,
    daytime varchar NOT NULL,
    hall int NOT NULL,
    rows int NOT NULL,
    seats int NOT NULL,
    price int NOT NULL,
    taken varchar[] NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_schedules_film_id ON schedules ("filmId");
