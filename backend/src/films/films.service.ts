import { Injectable, NotFoundException } from '@nestjs/common';
import { Film } from './entities/film.entity';
import { FilmsRepository } from 'src/repository/films.repository';
import { FilmDto, FilmsResponseDto } from './dto/films.dto';
import {
  FilmScheduleDto,
  FilmScheduleResponseDto,
} from './dto/filmSchedule.dto';
import { FilmSchedule } from './entities/film-schedule.entity';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  private serializeFilm(film: Film): FilmDto {
    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      image: film.image,
      cover: film.cover,
      title: film.title,
      about: film.about,
      description: film.description,
    };
  }

  private serializeShowtime(showtime: FilmSchedule): FilmScheduleDto {
    return {
      id: showtime.id,
      daytime: showtime.daytime,
      hall: showtime.hall,
      rows: showtime.rows,
      seats: showtime.seats,
      price: showtime.price,
      taken: showtime.taken,
    };
  }

  async findAll(): Promise<FilmsResponseDto> {
    const films = await this.filmsRepository.getAll();
    const items = films.map((movie) => this.serializeFilm(movie));

    return {
      items,
      total: items.length,
    };
  }

  async getFilmSchedule(filmId: string): Promise<FilmScheduleResponseDto> {
    const film = await this.filmsRepository.getById(filmId);

    if (!film) {
      throw new NotFoundException(`Film with id ${filmId} not found`);
    }

    const items = film.schedule.map((showtime) =>
      this.serializeShowtime(showtime),
    );

    return {
      items,
      total: film.schedule.length,
    };
  }
}
