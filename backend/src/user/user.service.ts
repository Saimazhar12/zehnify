import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { TreatmentService } from '../treatment/treatment.service';
import { SectionAssignmentStatus } from '../treatment/constants/section-assignment-status.enum';
import { AiUsageService } from '../ai/ai-usage.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private treatmentService: TreatmentService,
    private aiUsageService: AiUsageService,
  ) {}

  async findAll(): Promise<any[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      users.map(async (user) => {
        const base = {
          ...user,
          aiUsage: this.aiUsageService.toSummary(user.aiUsage),
        };

        if (user.role !== UserRole.USER) {
          return base;
        }

        const status = await this.treatmentService.getPatientStatus(user.id);
        return {
          ...base,
          treatmentStatus: status.status,
          intakeComplete: status.intakeProgress?.complete ?? false,
          reportGeneratable: status.reportGeneratable,
          hasInitialReport: status.hasInitialReport,
          sectionsAssigned: status.assignments.length,
          sectionsComplete: status.assignments.filter(
            (a) => a.status === SectionAssignmentStatus.COMPLETED,
          ).length,
          finalReportGeneratable: status.finalReportGeneratable,
          completionPercentage: status.completionPercentage,
        };
      }),
    );
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { googleId } });
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const allowed: Partial<User> = {};
    if (updateData.firstName !== undefined) allowed.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) allowed.lastName = updateData.lastName;
    if (updateData.role !== undefined) allowed.role = updateData.role;

    await this.userRepository.update(id, allowed);
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
