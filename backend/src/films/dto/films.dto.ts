import { IsString, IsNumber, IsArray } from 'class-validator';

export class FilmDto {
  @IsString()
  id: string;

  @IsNumber()
  rating: number;

  @IsString()
  director: string;

  @IsArray()
  tags: string[];

  @IsString()
  image: string;

  @IsString()
  cover: string;

  @IsString()
  title: string;

  @IsString()
  about: string;

  @IsString()
  description: string;
}

export class FilmsResponseDto {
  @IsArray()
  items: FilmDto[];

  @IsNumber()
  total: number;
}
