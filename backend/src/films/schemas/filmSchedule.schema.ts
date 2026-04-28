import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FilmSheduleDocument = HydratedDocument<FilmSchedule>;

@Schema()
export class FilmSchedule {
  @Prop({ required: true })
  id: string;

  @Prop({ type: Date, required: true })
  daytime: Date;

  @Prop({ required: true })
  hall: number;

  @Prop({ required: true })
  rows: number;

  @Prop({ required: true })
  seats: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  taken: string[];
}

export const FilmScheduleSchema = SchemaFactory.createForClass(FilmSchedule);