import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FilmSchedule } from './filmSchedule.schema';

export type FilmDocument = HydratedDocument<Film>;

@Schema()
export class Film {
  _id: Types.ObjectId;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  director: string;

  @Prop({ type: [String], required: true })
  tags: string[];

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  cover: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  about: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [FilmSchedule], required: true })
  schedule: FilmSchedule[];
}

export const FilmSchema = SchemaFactory.createForClass(Film);