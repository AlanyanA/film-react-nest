import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { randomUUID } from 'crypto';
import { Film } from './film.entity';

@Entity({ name: 'schedules' })
export class FilmSchedule {
  @PrimaryColumn('varchar')
  id: string;

  @BeforeInsert()
  genId() {
    if (!this.id) this.id = randomUUID();
  }

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
