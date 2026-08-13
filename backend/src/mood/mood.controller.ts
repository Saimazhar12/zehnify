import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MoodService } from './mood.service';
import { AtGuard, RolesGuard } from '../common/guards';
import { GetCurrentUser, GetCurrentUserId } from '../common/decorators';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';
import { AnalyzeMoodDto } from './dto/analyze-mood.dto';

function stripMoodPrediction<T extends { snapshot?: { prediction?: string | null; confidence?: number | null; allEmotions?: Record<string, number> | null } | null }>(
  result: T,
): T {
  if (!result.snapshot) {
    return result;
  }

  return {
    ...result,
    snapshot: {
      ...result.snapshot,
      prediction: null,
      confidence: null,
      allEmotions: null,
    },
  };
}

@UseGuards(AtGuard)
@Controller('mood')
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyze(
    @GetCurrentUser() user: { sub: string; role: UserRole },
    @GetCurrentUserId() userId: string,
    @Body() dto: AnalyzeMoodDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!dto.chatId) {
      throw new BadRequestException('chatId is required.');
    }

    const result = await this.moodService.analyzeFrame(userId, dto.chatId, file);

    if (user.role === UserRole.USER) {
      return stripMoodPrediction(result);
    }

    return result;
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Get('patient/:userId/insights')
  async getPatientInsights(@Param('userId') userId: string) {
    return this.moodService.getUserInsights(userId);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Get('chat/:chatId')
  async getChatSnapshots(@Param('chatId') chatId: string) {
    return this.moodService.getChatSnapshotsByChatId(chatId);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Get('chat/:chatId/summary')
  async getChatSummary(@Param('chatId') chatId: string) {
    return this.moodService.getChatSummaryByChatId(chatId);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Get('patient/:userId/summary')
  async getPatientSummaries(@Param('userId') userId: string) {
    return this.moodService.getPatientSummaries(userId);
  }
}
