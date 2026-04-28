import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model } from 'mongoose';
import { Film, FilmDocument } from 'src/films/schemas/film.schema';

@Injectable()
export class FilmsRepository {
  constructor(
    @InjectModel(Film.name, 'afisha')
    private readonly filmModel: Model<FilmDocument>,
  ) {}

  async getAll(): Promise<FilmDocument[]> {
    return this.filmModel.find().exec();
  }

  async getById(filmId: string): Promise<FilmDocument | null> {
    return this.filmModel.findById(filmId).exec();
  }

  async save(film: FilmDocument): Promise<FilmDocument> {
    return film.save();
  }
}