import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/createOrder.dto';
import { FilmsRepository } from 'src/repository/films.repository';
import { OrderResponseDto } from './dto/responseOrder.dto';
import { randomUUID } from 'crypto';
import { OrderItemDto } from './dto/order.dto';
import { FilmSchedule } from 'src/films/entities/film-schedule.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    private readonly filmsRepository: FilmsRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    this.ensureTicketsExist(dto);
    this.ensureUniqueTickets(dto);
    await this.ensureFilmsExist(dto);
    await this.reserveSeats(dto);
    return this.buildResponse(dto);
  }

  private ensureTicketsExist(dto: CreateOrderDto): void {
    if (!dto.tickets.length) {
      throw new BadRequestException('Ticket list is empty');
    }
  }

  private ensureUniqueTickets(dto: CreateOrderDto): void {
    const seenKeys = new Set<string>();

    for (const ticket of dto.tickets) {
      const ticketKey = `${ticket.row}:${ticket.seat}:${ticket.film}:${ticket.session}`;

      if (seenKeys.has(ticketKey)) {
        throw new BadRequestException(
          'Cannot reserve the same seat more than once in a single request',
        );
      }

      seenKeys.add(ticketKey);
    }
  }

  private async ensureFilmsExist(dto: CreateOrderDto): Promise<void> {
    for (const ticket of dto.tickets) {
      const filmId = ticket.film;
      const film = await this.filmsRepository.getById(filmId);

      if (!film) {
        throw new NotFoundException(`Film with id ${filmId} not found`);
      }

      const session = film.schedule.find((item) => item.id === ticket.session);

      if (!session) {
        throw new NotFoundException(
          `Session with id ${ticket.session} not found`,
        );
      }
    }
  }

  private async reserveSeats(dto: CreateOrderDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const scheduleRepository = manager.getRepository(FilmSchedule);

      for (const ticket of dto.tickets) {
        const seatKey = `${ticket.row}:${ticket.seat}`;

        const schedule = await scheduleRepository.findOne({
          where: { id: ticket.session },
          lock: { mode: 'pessimistic_write' },
        });

        if (!schedule) {
          throw new NotFoundException(
            `Session with id ${ticket.session} not found`,
          );
        }

        if (schedule.taken.includes(seatKey)) {
          throw new BadRequestException(`Seat ${seatKey} is already taken`);
        }

        schedule.taken = [...schedule.taken, seatKey];
        await scheduleRepository.save(schedule);
      }
    });
  }

  private buildResponse(dto: CreateOrderDto): OrderResponseDto {
    const items: OrderItemDto[] = dto.tickets.map((ticket) => ({
      id: randomUUID(),
      film: ticket.film,
      session: ticket.session,
      daytime: ticket.daytime,
      row: ticket.row,
      seat: ticket.seat,
      price: ticket.price,
    }));

    return {
      total: items.length,
      items,
    };
  }
}
