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
import { Film } from 'src/films/entities/film.entity';

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    this.ensureTicketsExist(dto);
    this.ensureUniqueTickets(dto);
    const filmsCache = await this.loadFilmsForTickets(dto);
    await this.reserveSeats(dto, filmsCache);
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

  private async loadFilmsForTickets(
    dto: CreateOrderDto,
  ): Promise<Map<string, Film>> {
    const filmsCache = new Map<string, Film>();

    for (const ticket of dto.tickets) {
      const filmId = ticket.film;
      let film = filmsCache.get(filmId);

      if (!film) {
        film = await this.filmsRepository.getById(filmId);

        if (!film) {
          throw new NotFoundException(`Film with id ${filmId} not found`);
        }

        filmsCache.set(filmId, film);
      }

      const session = film.schedule.find((item) => item.id === ticket.session);

      if (!session) {
        throw new NotFoundException(
          `Session with id ${ticket.session} not found`,
        );
      }

      const seatKey = `${ticket.row}:${ticket.seat}`;

      if (session.taken.includes(seatKey)) {
        throw new BadRequestException(`Seat ${seatKey} is already taken`);
      }
    }

    return filmsCache;
  }

  private async reserveSeats(
    dto: CreateOrderDto,
    filmsCache: Map<string, Film>,
  ): Promise<void> {
    const updatedFilms = new Set<string>();

    for (const ticket of dto.tickets) {
      const film = filmsCache.get(ticket.film);

      if (!film) {
        throw new NotFoundException(`Film with id ${ticket.film} not found`);
      }

      const session = film.schedule.find((item) => item.id === ticket.session);

      if (!session) {
        throw new NotFoundException(
          `Session with id ${ticket.session} not found`,
        );
      }

      session.taken.push(`${ticket.row}:${ticket.seat}`);
      updatedFilms.add(ticket.film);
    }

    for (const filmId of updatedFilms) {
      const film = filmsCache.get(filmId);

      if (!film) {
        throw new NotFoundException(`Film with id ${filmId} not found`);
      }

      await this.filmsRepository.save(film);
    }
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
