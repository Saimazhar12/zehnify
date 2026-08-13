import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ArticleType } from '../entities/wellness-article.entity';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  excerpt: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  content: string;

  @IsOptional()
  @IsEnum(ArticleType)
  type?: ArticleType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  readTimeMinutes?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  content?: string;

  @IsOptional()
  @IsEnum(ArticleType)
  type?: ArticleType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  readTimeMinutes?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
