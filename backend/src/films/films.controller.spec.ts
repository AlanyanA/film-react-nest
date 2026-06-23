import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmsResponseDto } from './dto/films.dto';
import { FilmScheduleResponseDto } from './dto/filmSchedule.dto';

describe('FilmsController', () => {
  let controller: FilmsController;
  let service: jest.Mocked<Pick<FilmsService, 'findAll' | 'getFilmSchedule'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: {
            findAll: jest.fn(),
            getFilmSchedule: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    service = module.get(FilmsService);
  });

  it('должен быть определён', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /films (list)', () => {
    it('должен возвращать список фильмов из сервиса', async () => {
      const expected: FilmsResponseDto = {
        total: 1,
        items: [
          {
            id: 'film-1',
            rating: 8.5,
            director: 'Director',
            tags: ['drama'],
            image: '/img.jpg',
            cover: '/cover.jpg',
            title: 'Title',
            about: 'about',
            description: 'desc',
          },
        ],
      };
      service.findAll.mockResolvedValue(expected);

      const result = await controller.list();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });

    it('должен возвращать пустой список, если фильмов нет', async () => {
      service.findAll.mockResolvedValue({ total: 0, items: [] });

      const result = await controller.list();

      expect(result.total).toBe(0);
      expect(result.items).toEqual([]);
    });

    it('должен пробрасывать ошибки сервиса наружу', async () => {
      service.findAll.mockRejectedValue(new Error('DB unavailable'));

      await expect(controller.list()).rejects.toThrow('DB unavailable');
    });
  });

  describe('GET /films/:id/schedule (schedule)', () => {
    it('должен возвращать расписание для указанного id фильма', async () => {
      const filmId = 'film-1';
      const expected: FilmScheduleResponseDto = {
        total: 1,
        items: [
          {
            id: 'session-1',
            daytime: new Date('2026-05-10T18:00:00'),
            hall: 1,
            rows: 5,
            seats: 10,
            price: 350,
            taken: [],
          },
        ],
      };
      service.getFilmSchedule.mockResolvedValue(expected);

      const result = await controller.schedule(filmId);

      expect(service.getFilmSchedule).toHaveBeenCalledWith(filmId);
      expect(service.getFilmSchedule).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });

    it('должен пробрасывать NotFoundException, если фильм не найден', async () => {
      service.getFilmSchedule.mockRejectedValue(
        new NotFoundException('Film with id missing not found'),
      );

      await expect(controller.schedule('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
