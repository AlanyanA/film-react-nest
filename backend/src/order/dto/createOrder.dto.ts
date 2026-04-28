import { CreateTicketDto } from './createTicket.dto';

export class CreateOrderDto {
  email: string;
  phone: string;
  tickets: CreateTicketDto[];
}