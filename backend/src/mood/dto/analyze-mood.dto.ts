import { IsUUID } from 'class-validator';

export class AnalyzeMoodDto {
  @IsUUID()
  chatId: string;
}
