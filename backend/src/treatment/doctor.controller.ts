import { Controller, Get, Post, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TreatmentService } from './treatment.service';
import { NotificationService } from '../notification/notification.service';
import { AtGuard, RolesGuard } from '../common/guards';
import { GetCurrentUserId } from '../common/decorators';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';
import { AssignSectionsDto } from './dto/assign-sections.dto';
import { SendCustomNotificationDto } from '../notification/dto/send-custom-notification.dto';

@UseGuards(AtGuard, RolesGuard)
@Controller('doctor')
export class DoctorController {
  constructor(
    private readonly treatmentService: TreatmentService,
    private readonly notificationService: NotificationService,
  ) {}

  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Get('patients')
  async getPatients() {
    return this.treatmentService.getDoctorPatients();
  }

  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Get('patients/:userId/treatment')
  async getPatientTreatment(@Param('userId') userId: string) {
    return this.treatmentService.getPatientTreatmentDetail(userId);
  }

  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Post('patients/:userId/assign-sections')
  async assignSections(
    @GetCurrentUserId() doctorId: string,
    @Param('userId') userId: string,
    @Body() dto: AssignSectionsDto,
  ) {
    return this.treatmentService.assignSections(doctorId, userId, dto.sections);
  }

  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Get('patients/:userId/reports')
  async getPatientReports(@Param('userId') userId: string) {
    return this.treatmentService.getPatientReports(userId);
  }

  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Post('patients/:userId/notifications')
  @HttpCode(HttpStatus.CREATED)
  async sendNotification(
    @GetCurrentUserId() senderId: string,
    @Param('userId') userId: string,
    @Body() dto: SendCustomNotificationDto,
  ) {
    return this.notificationService.sendCustomMessage(senderId, userId, dto);
  }
}
