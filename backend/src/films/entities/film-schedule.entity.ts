import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Film } from './film.entity';

@Entity({ name: 'schedules' })
export class FilmSchedule {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ type: 'timestamptz' })
  daytime: Date;

  @Column('int')
  hall: number;

  @Column('int')
  rows: number;

  @Column('int')
  seats: number;

  @Column('float')
  price: number;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  taken: string[];

  @ManyToOne(() => Film, (film) => film.schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'film_id' })
  film: Film;
}
