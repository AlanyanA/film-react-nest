import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from './entities/film.entity';
import { FilmSchedule } from './entities/film-schedule.entity';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmsRepository } from 'src/repository/films.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Film, FilmSchedule])],
  controllers: [FilmsController],
  providers: [FilmsService, FilmsRepository],
  exports: [FilmsService, FilmsRepository],
})
export class FilmsModule {}