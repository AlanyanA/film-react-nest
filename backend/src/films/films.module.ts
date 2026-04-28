import { Module } from '@nestjs/common';
import { Film, FilmSchema } from './schemas/film.schema';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmsRepository } from 'src/repository/films.repository';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Film.name, schema: FilmSchema }],
      'afisha',
    ),
  ],
  controllers: [FilmsController],
  providers: [FilmsService, FilmsRepository],
  exports: [FilmsService, FilmsRepository],
})
export class FilmsModule {}