import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SendCustomNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  body: string;
}
