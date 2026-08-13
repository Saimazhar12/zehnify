import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalNoteDto, UpdateJournalNoteDto } from './dto/create-journal-note.dto';
import { AtGuard } from '../common/guards';
import { GetCurrentUserId } from '../common/decorators';

@UseGuards(AtGuard)
@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get('notes')
  getNotes(@GetCurrentUserId() userId: string) {
    return this.journalService.getNotes(userId);
  }

  @Post('notes')
  @HttpCode(HttpStatus.CREATED)
  createNote(
    @GetCurrentUserId() userId: string,
    @Body() dto: CreateJournalNoteDto,
  ) {
    return this.journalService.createNote(userId, dto);
  }

  @Patch('notes/:id')
  updateNote(
    @GetCurrentUserId() userId: string,
    @Param('id') noteId: string,
    @Body() dto: UpdateJournalNoteDto,
  ) {
    return this.journalService.updateNote(userId, noteId, dto);
  }

  @Delete('notes/:id')
  @HttpCode(HttpStatus.OK)
  deleteNote(
    @GetCurrentUserId() userId: string,
    @Param('id') noteId: string,
  ) {
    return this.journalService.deleteNote(userId, noteId);
  }
}
