import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { TreatmentService } from './treatment.service';
import { AtGuard, RolesGuard } from '../common/guards';
import { GetCurrentUserId } from '../common/decorators';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';

@UseGuards(AtGuard, RolesGuard)
@Controller('treatment')
export class TreatmentController {
  constructor(private readonly treatmentService: TreatmentService) {}

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Get('status')
  async getStatus(@GetCurrentUserId() userId: string) {
    return this.treatmentService.getPatientStatus(userId);
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Get('assignments')
  async getAssignments(@GetCurrentUserId() userId: string) {
    return this.treatmentService.getPatientAssignments(userId);
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post('assignments/:id/start')
  async startAssignment(
    @GetCurrentUserId() userId: string,
    @Param('id') assignmentId: string,
  ) {
    return this.treatmentService.startSectionAssignment(userId, assignmentId);
  }
}
