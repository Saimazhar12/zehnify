import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalNote } from './entities/journal-note.entity';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JournalNote])],
  controllers: [JournalController],
  providers: [JournalService],
})
export class JournalModule {}
