import {
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_USER_INPUT_MAX_LENGTH,
  USER_INPUT_MAX_LENGTH_ENV,
} from '../constants/production-limits';

@Injectable()
export class UserInputMaxLengthPipe implements PipeTransform<string, string> {
  constructor(private readonly configService: ConfigService) {}

  transform(value: string): string {
    if (typeof value !== 'string') {
      throw new BadRequestException('Input must be a string.');
    }

    const maxLength = parseInt(
      this.configService.get<string>(USER_INPUT_MAX_LENGTH_ENV) ||
        String(DEFAULT_USER_INPUT_MAX_LENGTH),
      10,
    );

    const trimmed = value.trim();
    if (!trimmed) {
      throw new BadRequestException('Input cannot be empty.');
    }

    if (trimmed.length > maxLength) {
      throw new BadRequestException(
        `Input must be at most ${maxLength} characters.`,
      );
    }

    return trimmed;
  }
}

export function getUserInputMaxLength(configService: ConfigService): number {
  return parseInt(
    configService.get<string>(USER_INPUT_MAX_LENGTH_ENV) ||
      String(DEFAULT_USER_INPUT_MAX_LENGTH),
    10,
  );
}
