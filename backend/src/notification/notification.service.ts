import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationType } from './constants/notification-type.enum';
import { User, UserRole } from '../user/user.entity';
import { SendCustomNotificationDto } from './dto/send-custom-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getForRecipient(recipientId: string) {
    return this.notificationRepository.find({
      where: { recipientId },
      order: { createdAt: 'DESC' },
      relations: ['sender'],
    }).then((notifications) =>
      notifications.map((n) => this.toResponse(n)),
    );
  }

  async getUnreadCount(recipientId: string) {
    const count = await this.notificationRepository.count({
      where: { recipientId, isRead: false },
    });
    return { count };
  }

  async markAsRead(recipientId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipientId },
      relations: ['sender'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await this.notificationRepository.save(notification);
    }

    return this.toResponse(notification);
  }

  async markAllAsRead(recipientId: string) {
    await this.notificationRepository.update(
      { recipientId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return { success: true };
  }

  async createSectionAssignedNotification(
    recipientId: string,
    senderId: string,
    sections: Array<{ id: string; sectionType: number; sectionLabel: string }>,
    treatmentPlanId: string,
  ) {
    const labels = sections.map((s) => s.sectionLabel).join(', ');
    const notification = this.notificationRepository.create({
      recipientId,
      senderId,
      type: NotificationType.SECTION_ASSIGNED,
      title: 'New sections assigned',
      body: `Your doctor has assigned ${sections.length} treatment section${
        sections.length === 1 ? '' : 's'
      } to you: ${labels}.`,
      metadata: {
        treatmentPlanId,
        sections: sections.map((s) => ({
          id: s.id,
          sectionType: s.sectionType,
          sectionLabel: s.sectionLabel,
        })),
      },
      isRead: false,
      readAt: null,
    });

    const saved = await this.notificationRepository.save(notification);
    return this.toResponse(saved);
  }

  async sendCustomMessage(
    senderId: string,
    recipientId: string,
    dto: SendCustomNotificationDto,
  ) {
    const recipient = await this.userRepository.findOne({
      where: { id: recipientId },
    });

    if (!recipient || recipient.role !== UserRole.USER) {
      throw new NotFoundException('Patient not found.');
    }

    const notification = this.notificationRepository.create({
      recipientId,
      senderId,
      type: NotificationType.CUSTOM_MESSAGE,
      title: dto.title.trim(),
      body: dto.body.trim(),
      metadata: null,
      isRead: false,
      readAt: null,
    });

    const saved = await this.notificationRepository.save(notification);
    const withSender = await this.notificationRepository.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });

    return this.toResponse(withSender!);
  }

  private toResponse(notification: Notification) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      metadata: notification.metadata,
      isRead: notification.isRead,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      sender: notification.sender
        ? {
            id: notification.sender.id,
            firstName: notification.sender.firstName,
            lastName: notification.sender.lastName,
            role: notification.sender.role,
          }
        : notification.senderId
          ? { id: notification.senderId }
          : null,
    };
  }
}
