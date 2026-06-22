import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { FilmSchedule } from './film-schedule.entity';

@Entity({ name: 'films' })
export class Film {
  @PrimaryColumn('varchar')
  id: string;

  @BeforeInsert()
  genId() {
    if (!this.id) this.id = randomUUID();
  }

  @Column('float')
  rating: number;

  @Column()
  director: string;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  tags: string[];

  @Column()
  image: string;

  @Column()
  cover: string;

  @Column()
  title: string;

  @Column()
  about: string;

  @Column()
  description: string;

  @OneToMany(() => FilmSchedule, (schedule) => schedule.film, {
    cascade: true,
    eager: true,
  })
  schedule: FilmSchedule[];
}
