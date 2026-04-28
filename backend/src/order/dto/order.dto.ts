import { CreateTicketDto } from './createTicket.dto';
import { OmitType } from '@nestjs/mapped-types';

export class OrderItemDto extends OmitType(CreateTicketDto, [
  'day',
  'time',
] as const) {
  id: string;
}