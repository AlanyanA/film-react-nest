import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from 'src/films/entities/film.entity';

@Injectable()
export class FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
  ) {}

  async getAll(): Promise<Film[]> {
    return this.filmRepository.find({ relations: ['schedule'] });
  }

  async getById(filmId: string): Promise<Film | null> {
    return this.filmRepository.findOne({
      where: { id: filmId },
      relations: ['schedule'],
    });
  }

  async save(film: Film): Promise<Film> {
    return this.filmRepository.save(film);
  }
}
