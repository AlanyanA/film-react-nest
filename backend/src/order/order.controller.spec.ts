import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/createOrder.dto';
import { OrderResponseDto } from './dto/responseOrder.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: jest.Mocked<Pick<OrderService, 'createOrder'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            createOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get(OrderService);
  });

  it('должен быть определён', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /order (create)', () => {
    const orderDto: CreateOrderDto = {
      email: 'user@example.com',
      phone: '+71234567890',
      tickets: [
        {
          film: 'film-1',
          session: 'session-1',
          daytime: '2026-05-10T18:00',
          day: '10 мая',
          time: '18:00',
          row: 1,
          seat: 2,
          price: 350,
        },
      ],
    };

    it('должен передавать данные в сервис и возвращать его ответ', async () => {
      const expected: OrderResponseDto = {
        total: 1,
        items: [{ ...orderDto.tickets[0], id: 'ticket-1' }],
      };
      service.createOrder.mockResolvedValue(expected);

      const result = await controller.create(orderDto);

      expect(service.createOrder).toHaveBeenCalledWith(orderDto);
      expect(service.createOrder).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });

    it('должен корректно обрабатывать заказ с несколькими билетами', async () => {
      const multiOrder: CreateOrderDto = {
        ...orderDto,
        tickets: [
          { ...orderDto.tickets[0] },
          { ...orderDto.tickets[0], row: 1, seat: 3 },
        ],
      };
      const expected: OrderResponseDto = {
        total: 2,
        items: [
          { ...multiOrder.tickets[0], id: 'ticket-1' },
          { ...multiOrder.tickets[1], id: 'ticket-2' },
        ],
      };
      service.createOrder.mockResolvedValue(expected);

      const result = await controller.create(multiOrder);

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('должен пробрасывать BadRequestException для занятых мест', async () => {
      service.createOrder.mockRejectedValue(
        new BadRequestException('Seat 1:2 is already taken'),
      );

      await expect(controller.create(orderDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('должен пробрасывать NotFoundException для несуществующего фильма', async () => {
      service.createOrder.mockRejectedValue(
        new NotFoundException('Film with id film-1 not found'),
      );

      await expect(controller.create(orderDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
