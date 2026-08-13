import { Controller, Post, Body, Get, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GetCurrentUserId } from '../common/decorators';
import { AtGuard } from '../common/guards';
import { SendMessageDto } from './dto/send-message.dto';

@UseGuards(AtGuard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('message')
    async sendMessage(
        @GetCurrentUserId() userId: string,
        @Body() body: SendMessageDto,
    ) {
        if (!body.type && !body.chatId) throw new BadRequestException('Type is required for new chat');

        return this.chatService.sendMessage(
            userId,
            body.chatId,
            body.type ?? 0,
            body.content,
        );
    }

    @Get('history')
    async getUserChats(
        @GetCurrentUserId() userId: string,
        @Query('type') type?: string,
        @Query('treatmentPlanId') treatmentPlanId?: string,
        @Query('chatId') chatId?: string,
    ) {
        return this.chatService.getUserChats(
            userId,
            type ? parseInt(type) : undefined,
            treatmentPlanId,
            chatId,
        );
    }
}
