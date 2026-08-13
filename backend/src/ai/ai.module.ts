import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../user/user.entity';
import { AiUsageService } from './ai-usage.service';
import { GeminiService } from './gemini.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  providers: [AiUsageService, GeminiService],
  exports: [AiUsageService, GeminiService],
})
export class AiModule {}
