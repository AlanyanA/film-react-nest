import { OrderItemDto } from './order.dto';

export class OrderResponseDto {
  total: number;
  items: OrderItemDto[];
}