import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentPlan } from './entities/treatment-plan.entity';
import { SectionAssignment } from './entities/section-assignment.entity';
import { ClinicalReport } from './entities/clinical-report.entity';
import { TreatmentService } from './treatment.service';
import { TreatmentController } from './treatment.controller';
import { DoctorController } from './doctor.controller';
import { Chat } from '../chat/entities/chat.entity';
import { Message } from '../chat/entities/message.entity';
import { User } from '../user/user.entity';
import { AiModule } from '../ai/ai.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TreatmentPlan,
      SectionAssignment,
      ClinicalReport,
      Chat,
      Message,
      User,
    ]),
    AiModule,
    NotificationModule,
  ],
  controllers: [TreatmentController, DoctorController],
  providers: [TreatmentService],
  exports: [TreatmentService],
})
export class TreatmentModule {}
