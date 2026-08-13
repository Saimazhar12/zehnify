import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AtGuard } from '../common/guards';
import { GetCurrentUserId } from '../common/decorators';

@UseGuards(AtGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getNotifications(@GetCurrentUserId() userId: string) {
    return this.notificationService.getForRecipient(userId);
  }

  @Get('unread-count')
  getUnreadCount(@GetCurrentUserId() userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Patch('read-all')
  markAllAsRead(@GetCurrentUserId() userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  markAsRead(
    @GetCurrentUserId() userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationService.markAsRead(userId, notificationId);
  }
}
