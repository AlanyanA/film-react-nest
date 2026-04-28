import { Injectable, NotFoundException } from '@nestjs/common';
import { FilmDocument } from './schemas/film.schema';
import { FilmsRepository } from 'src/repository/films.repository';
import { FilmDto, FilmsResponseDto } from './dto/films.dto';
import {
  FilmScheduleDto,
  FilmScheduleResponseDto,
} from './dto/filmSchedule.dto';
import { FilmSchedule } from './schemas/filmSchedule.schema';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  private serializeFilm(film: FilmDocument): FilmDto {
    const {
      _id,
      rating,
      director,
      tags,
      image,
      cover,
      title,
      about,
      description,
    } = film;

    return {
      id: _id.toString(),
      rating,
      director,
      tags,
      image,
      cover,
      title,
      about,
      description,
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

  private serializeShowtime(showtime: FilmSchedule): FilmScheduleDto {
    const { id, daytime, hall, rows, seats, price, taken } = showtime;

    return {
      id,
      daytime,
      hall,
      rows,
      seats,
      price,
      taken,
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