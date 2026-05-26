import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class QueueDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class ReviewDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsNumber()
  @IsNotEmpty()
  rating: number;
}

export class AiChatDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
