import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { FilmsModule } from 'src/films/films.module';

@Module({
  imports: [FilmsModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}