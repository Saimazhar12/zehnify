import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { DEFAULT_USER_INPUT_MAX_LENGTH } from '../../common/constants/production-limits';

export class CreateJournalNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(DEFAULT_USER_INPUT_MAX_LENGTH)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(DEFAULT_USER_INPUT_MAX_LENGTH)
  content: string;
}

export class UpdateJournalNoteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(DEFAULT_USER_INPUT_MAX_LENGTH)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(DEFAULT_USER_INPUT_MAX_LENGTH)
  content?: string;
}
