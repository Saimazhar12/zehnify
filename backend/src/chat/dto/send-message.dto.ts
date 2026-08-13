import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { DEFAULT_USER_INPUT_MAX_LENGTH } from '../../common/constants/production-limits';

export class SendMessageDto {
  @IsOptional()
  @IsUUID()
  chatId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  type?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(DEFAULT_USER_INPUT_MAX_LENGTH)
  content: string;
}
