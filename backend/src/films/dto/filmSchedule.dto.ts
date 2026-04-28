export class FilmScheduleDto {
  id: string;
  daytime: Date;
  hall: number;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export class FilmScheduleResponseDto {
  items: FilmScheduleDto[];
  total: number;
}