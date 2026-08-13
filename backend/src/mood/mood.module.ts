import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EmotionSnapshot } from './entities/emotion-snapshot.entity';
import { Chat } from '../chat/entities/chat.entity';
import { MoodService } from './mood.service';
import { MoodController } from './mood.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmotionSnapshot, Chat]),
    ConfigModule,
  ],
  controllers: [MoodController],
  providers: [MoodService],
  exports: [MoodService],
})
export class MoodModule {}
