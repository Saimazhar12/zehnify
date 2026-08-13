import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalNote } from './entities/journal-note.entity';
import { CreateJournalNoteDto, UpdateJournalNoteDto } from './dto/create-journal-note.dto';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(JournalNote)
    private readonly journalNoteRepository: Repository<JournalNote>,
  ) {}

  async getNotes(userId: string) {
    return this.journalNoteRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async createNote(userId: string, dto: CreateJournalNoteDto) {
    const note = this.journalNoteRepository.create({
      userId,
      title: dto.title.trim(),
      content: dto.content.trim(),
    });
    return this.journalNoteRepository.save(note);
  }

  async updateNote(userId: string, noteId: string, dto: UpdateJournalNoteDto) {
    const note = await this.journalNoteRepository.findOne({
      where: { id: noteId, userId },
    });

    if (!note) {
      throw new NotFoundException('Journal note not found.');
    }

    if (dto.title !== undefined) {
      note.title = dto.title.trim();
    }

    if (dto.content !== undefined) {
      note.content = dto.content.trim();
    }

    return this.journalNoteRepository.save(note);
  }

  async deleteNote(userId: string, noteId: string) {
    const note = await this.journalNoteRepository.findOne({
      where: { id: noteId, userId },
    });

    if (!note) {
      throw new NotFoundException('Journal note not found.');
    }

    await this.journalNoteRepository.remove(note);
    return { deleted: true };
  }
}
