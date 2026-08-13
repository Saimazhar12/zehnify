import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager } from 'typeorm';
import { TreatmentPlan } from './entities/treatment-plan.entity';
import { SectionAssignment } from './entities/section-assignment.entity';
import { ClinicalReport } from './entities/clinical-report.entity';
import { TreatmentPlanStatus } from './constants/treatment-plan-status.enum';
import { SectionAssignmentStatus } from './constants/section-assignment-status.enum';
import { ClinicalReportType } from './constants/clinical-report-type.enum';
import {
  ChatType,
  ASSIGNABLE_SECTION_TYPES,
  CHAT_TYPE_LABELS,
  INTAKE_USER_MESSAGE_LIMIT,
  getUserMessageLimit,
} from '../chat/constants/chat-type.enum';
import { ChatStatus } from '../chat/constants/chat-status.enum';
import { Chat } from '../chat/entities/chat.entity';
import { Message, MessageSender } from '../chat/entities/message.entity';
import { User, UserRole } from '../user/user.entity';
import { SectionAssignmentItemDto } from './dto/assign-sections.dto';
import { AiUsageService } from '../ai/ai-usage.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TreatmentService {
  constructor(
    @InjectRepository(TreatmentPlan)
    private treatmentPlanRepository: Repository<TreatmentPlan>,
    @InjectRepository(SectionAssignment)
    private sectionAssignmentRepository: Repository<SectionAssignment>,
    @InjectRepository(ClinicalReport)
    private clinicalReportRepository: Repository<ClinicalReport>,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private aiUsageService: AiUsageService,
    private notificationService: NotificationService,
  ) {}

  async getOrCreateActivePlan(patientId: string): Promise<TreatmentPlan> {
    const activeStatuses = [
      TreatmentPlanStatus.INTAKE_IN_PROGRESS,
      TreatmentPlanStatus.INTAKE_COMPLETE,
      TreatmentPlanStatus.SECTIONS_ASSIGNED,
      TreatmentPlanStatus.SECTIONS_IN_PROGRESS,
      TreatmentPlanStatus.SECTIONS_COMPLETE,
    ];

    let plan = await this.treatmentPlanRepository.findOne({
      where: { patientId, status: In(activeStatuses) },
      relations: ['sectionAssignments'],
      order: { createdAt: 'DESC' },
    });

    if (!plan) {
      plan = this.treatmentPlanRepository.create({
        patientId,
        status: TreatmentPlanStatus.INTAKE_IN_PROGRESS,
      });
      plan = await this.treatmentPlanRepository.save(plan);
    }

    return plan;
  }

  async getActivePlan(patientId: string): Promise<TreatmentPlan | null> {
    const activeStatuses = [
      TreatmentPlanStatus.INTAKE_IN_PROGRESS,
      TreatmentPlanStatus.INTAKE_COMPLETE,
      TreatmentPlanStatus.SECTIONS_ASSIGNED,
      TreatmentPlanStatus.SECTIONS_IN_PROGRESS,
      TreatmentPlanStatus.SECTIONS_COMPLETE,
    ];

    return this.treatmentPlanRepository.findOne({
      where: { patientId, status: In(activeStatuses) },
      relations: ['sectionAssignments'],
      order: { createdAt: 'DESC' },
    });
  }

  async getIntakeChat(plan: TreatmentPlan, userId: string): Promise<Chat | null> {
    if (plan.intakeChatId) {
      return this.chatRepository.findOne({
        where: { id: plan.intakeChatId, userId },
        relations: ['messages'],
      });
    }
    return null;
  }

  async ensureIntakeChat(plan: TreatmentPlan, userId: string): Promise<Chat> {
    const existing = await this.getIntakeChat(plan, userId);
    if (existing) return existing;

    const chat = this.chatRepository.create({
      userId,
      type: ChatType.INTAKE_ASSESSMENT,
      status: ChatStatus.ACTIVE,
      treatmentPlanId: plan.id,
      title: 'Intake Assessment',
    });
    const saved = await this.chatRepository.save(chat);

    plan.intakeChatId = saved.id;
    await this.treatmentPlanRepository.save(plan);

    return { ...saved, messages: [] };
  }

  countUserMessages(messages: Message[]): number {
    return messages.filter((m) => m.sender === MessageSender.USER).length;
  }

  async validateMessageAllowed(
    userId: string,
    chat: Chat,
    userMessageCount: number,
  ): Promise<void> {
    if (chat.status === ChatStatus.COMPLETED || chat.status === ChatStatus.LOCKED) {
      throw new BadRequestException('This chat session is complete and no longer accepts messages.');
    }

    const limit = getUserMessageLimit(chat.type);
    if (userMessageCount >= limit) {
      throw new BadRequestException(`Message limit of ${limit} reached for this session.`);
    }

    if (chat.type === ChatType.INTAKE_ASSESSMENT) {
      const plan = await this.getActivePlan(userId);
      if (!plan) throw new BadRequestException('No active treatment plan found.');
      return;
    }

    if (!chat.sectionAssignmentId) {
      throw new BadRequestException('This section chat is not linked to an assignment.');
    }

    const assignment = await this.sectionAssignmentRepository.findOne({
      where: { id: chat.sectionAssignmentId },
      relations: ['treatmentPlan'],
    });

    if (!assignment || assignment.treatmentPlan.patientId !== userId) {
      throw new NotFoundException('Section assignment not found.');
    }

    if (assignment.status === SectionAssignmentStatus.COMPLETED) {
      throw new BadRequestException('This section is already completed.');
    }

    if (assignment.status === SectionAssignmentStatus.ASSIGNED) {
      assignment.status = SectionAssignmentStatus.IN_PROGRESS;
      await this.sectionAssignmentRepository.save(assignment);

      const plan = await this.treatmentPlanRepository.findOne({
        where: { id: assignment.treatmentPlanId },
      });
      if (
        plan &&
        (plan.status === TreatmentPlanStatus.SECTIONS_ASSIGNED ||
          plan.status === TreatmentPlanStatus.INTAKE_COMPLETE)
      ) {
        plan.status = TreatmentPlanStatus.SECTIONS_IN_PROGRESS;
        await this.treatmentPlanRepository.save(plan);
      }
    }

    await this.validateSectionUnlocked(assignment);
  }

  async validateSectionUnlocked(assignment: SectionAssignment): Promise<void> {
    const allAssignments = await this.sectionAssignmentRepository.find({
      where: { treatmentPlanId: assignment.treatmentPlanId },
      order: { sortOrder: 'ASC' },
    });

    const incompletePrior = allAssignments.filter(
      (a) =>
        a.sortOrder < assignment.sortOrder &&
        a.status !== SectionAssignmentStatus.COMPLETED,
    );

    if (incompletePrior.length > 0) {
      throw new ForbiddenException(
        'Complete previous assigned sections before starting this one.',
      );
    }
  }

  async handleMessageComplete(
    chat: Chat,
    newUserMessageCount: number,
    manager?: EntityManager,
  ): Promise<{ messagesRemaining: number; sectionStatus?: SectionAssignmentStatus; planStatus?: TreatmentPlanStatus }> {
    const chatRepo = manager ? manager.getRepository(Chat) : this.chatRepository;
    const planRepo = manager
      ? manager.getRepository(TreatmentPlan)
      : this.treatmentPlanRepository;
    const assignmentRepo = manager
      ? manager.getRepository(SectionAssignment)
      : this.sectionAssignmentRepository;

    const limit = getUserMessageLimit(chat.type);
    const messagesRemaining = Math.max(0, limit - newUserMessageCount);

    if (newUserMessageCount < limit) {
      return { messagesRemaining };
    }

    await chatRepo.update(chat.id, { status: ChatStatus.COMPLETED });
    chat.status = ChatStatus.COMPLETED;

    if (chat.type === ChatType.INTAKE_ASSESSMENT && chat.treatmentPlanId) {
      const plan = await planRepo.findOne({
        where: { id: chat.treatmentPlanId },
      });
      if (plan) {
        plan.status = TreatmentPlanStatus.INTAKE_COMPLETE;
        await planRepo.save(plan);
        return { messagesRemaining: 0, planStatus: plan.status };
      }
    }

    if (chat.sectionAssignmentId) {
      const assignment = await assignmentRepo.findOne({
        where: { id: chat.sectionAssignmentId },
      });
      if (assignment) {
        assignment.status = SectionAssignmentStatus.COMPLETED;
        assignment.completedAt = new Date();
        await assignmentRepo.save(assignment);
        await this.updatePlanStatusAfterSection(assignment.treatmentPlanId, manager);
        return {
          messagesRemaining: 0,
          sectionStatus: assignment.status,
        };
      }
    }

    return { messagesRemaining: 0 };
  }

  private async updatePlanStatusAfterSection(
    treatmentPlanId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const assignmentRepo = manager
      ? manager.getRepository(SectionAssignment)
      : this.sectionAssignmentRepository;
    const planRepo = manager
      ? manager.getRepository(TreatmentPlan)
      : this.treatmentPlanRepository;

    const assignments = await assignmentRepo.find({
      where: { treatmentPlanId },
    });

    if (assignments.length === 0) return;

    const allComplete = assignments.every(
      (a) => a.status === SectionAssignmentStatus.COMPLETED,
    );
    const anyInProgress = assignments.some(
      (a) => a.status === SectionAssignmentStatus.IN_PROGRESS,
    );

    const plan = await planRepo.findOne({
      where: { id: treatmentPlanId },
    });
    if (!plan) return;

    if (allComplete) {
      plan.status = TreatmentPlanStatus.SECTIONS_COMPLETE;
    } else if (anyInProgress) {
      plan.status = TreatmentPlanStatus.SECTIONS_IN_PROGRESS;
    }

    await planRepo.save(plan);
  }

  async getPatientStatus(patientId: string) {
    const plan = await this.getActivePlan(patientId);
    if (!plan) {
      return {
        hasActivePlan: false,
        status: null,
        intakeProgress: null,
        assignments: [] as Array<{
          id: string;
          sectionType: ChatType;
          sectionLabel: string;
          status: SectionAssignmentStatus;
          sortOrder: number;
          doctorNotes: string | null;
          chatId: string | null;
          requiredUserMessages: number;
        }>,
        completionPercentage: 0,
        reportGeneratable: false,
        hasInitialReport: false,
        finalReportGeneratable: false,
      };
    }

    const intakeChat = plan.intakeChatId
      ? await this.chatRepository.findOne({
          where: { id: plan.intakeChatId },
          relations: ['messages'],
        })
      : null;

    const intakeUserMessages = intakeChat
      ? this.countUserMessages(intakeChat.messages ?? [])
      : 0;

    const assignments = await this.sectionAssignmentRepository.find({
      where: { treatmentPlanId: plan.id },
      order: { sortOrder: 'ASC' },
    });

    const completedSections = assignments.filter(
      (a) => a.status === SectionAssignmentStatus.COMPLETED,
    ).length;

    const completionPercentage =
      assignments.length > 0
        ? Math.round((completedSections / assignments.length) * 100)
        : intakeUserMessages >= INTAKE_USER_MESSAGE_LIMIT
          ? 100
          : Math.round((intakeUserMessages / INTAKE_USER_MESSAGE_LIMIT) * 100);

    const hasInitialReport = await this.clinicalReportRepository.exists({
      where: {
        treatmentPlanId: plan.id,
        reportType: ClinicalReportType.INITIAL_INTAKE,
      },
    });

    return {
      hasActivePlan: true,
      planId: plan.id,
      status: plan.status,
      intakeProgress: {
        chatId: plan.intakeChatId,
        userMessages: intakeUserMessages,
        required: INTAKE_USER_MESSAGE_LIMIT,
        complete: intakeUserMessages >= INTAKE_USER_MESSAGE_LIMIT,
      },
      assignments: assignments.map((a) => ({
        id: a.id,
        sectionType: a.sectionType,
        sectionLabel: CHAT_TYPE_LABELS[a.sectionType],
        status: a.status,
        sortOrder: a.sortOrder,
        doctorNotes: a.doctorNotes,
        chatId: a.chatId,
        requiredUserMessages: a.requiredUserMessages,
      })),
      completionPercentage,
      reportGeneratable: intakeUserMessages >= INTAKE_USER_MESSAGE_LIMIT,
      hasInitialReport,
      finalReportGeneratable:
        assignments.length > 0 &&
        assignments.every((a) => a.status === SectionAssignmentStatus.COMPLETED),
    };
  }

  async getPatientAssignments(patientId: string) {
    const status = await this.getPatientStatus(patientId);
    return status.assignments;
  }

  async startSectionAssignment(patientId: string, assignmentId: string) {
    const assignment = await this.sectionAssignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['treatmentPlan'],
    });

    if (!assignment || assignment.treatmentPlan.patientId !== patientId) {
      throw new NotFoundException('Assignment not found.');
    }

    if (assignment.status === SectionAssignmentStatus.COMPLETED) {
      throw new BadRequestException('This section is already completed.');
    }

    await this.validateSectionUnlocked(assignment);

    if (assignment.chatId) {
      const chat = await this.chatRepository.findOne({
        where: { id: assignment.chatId },
        relations: ['messages'],
      });
      if (chat) return chat;
    }

    const chat = this.chatRepository.create({
      userId: patientId,
      type: assignment.sectionType,
      status: ChatStatus.ACTIVE,
      treatmentPlanId: assignment.treatmentPlanId,
      sectionAssignmentId: assignment.id,
      title: CHAT_TYPE_LABELS[assignment.sectionType],
    });
    const savedChat = await this.chatRepository.save(chat);

    assignment.chatId = savedChat.id;
    assignment.status = SectionAssignmentStatus.IN_PROGRESS;
    await this.sectionAssignmentRepository.save(assignment);

    const plan = assignment.treatmentPlan;
    if (
      plan.status === TreatmentPlanStatus.SECTIONS_ASSIGNED ||
      plan.status === TreatmentPlanStatus.INTAKE_COMPLETE
    ) {
      plan.status = TreatmentPlanStatus.SECTIONS_IN_PROGRESS;
      await this.treatmentPlanRepository.save(plan);
    }

    return { ...savedChat, messages: [] };
  }

  async assignSections(
    doctorId: string,
    patientId: string,
    sections: SectionAssignmentItemDto[],
  ) {
    const patient = await this.userRepository.findOne({ where: { id: patientId } });
    if (!patient || patient.role !== UserRole.USER) {
      throw new NotFoundException('Patient not found.');
    }

    const plan = await this.getActivePlan(patientId);
    if (!plan) {
      throw new BadRequestException('Patient has no active treatment plan.');
    }

    if (plan.status !== TreatmentPlanStatus.INTAKE_COMPLETE) {
      throw new BadRequestException('Intake must be completed before assigning sections.');
    }

    const hasInitialReport = await this.clinicalReportRepository.exists({
      where: {
        treatmentPlanId: plan.id,
        reportType: ClinicalReportType.INITIAL_INTAKE,
      },
    });

    if (!hasInitialReport) {
      throw new BadRequestException(
        'Initial intake report must be generated before assigning sections.',
      );
    }

    const existingAssignments = await this.sectionAssignmentRepository.count({
      where: { treatmentPlanId: plan.id },
    });
    if (existingAssignments > 0) {
      throw new BadRequestException('Sections have already been assigned for this plan.');
    }

    const sectionTypes = sections.map((s) => s.sectionType);
    const invalidTypes = sectionTypes.filter(
      (t) => !ASSIGNABLE_SECTION_TYPES.includes(t),
    );
    if (invalidTypes.length > 0) {
      throw new BadRequestException('Invalid section types. Only types 2-6 are assignable.');
    }

    const uniqueTypes = new Set(sectionTypes);
    if (uniqueTypes.size !== sectionTypes.length) {
      throw new BadRequestException('Duplicate section types are not allowed.');
    }

    const assignments = sections.map((section) =>
      this.sectionAssignmentRepository.create({
        treatmentPlanId: plan.id,
        sectionType: section.sectionType,
        sortOrder: section.sortOrder,
        doctorNotes: section.doctorNotes ?? null,
        status: SectionAssignmentStatus.ASSIGNED,
      }),
    );

    const savedAssignments = await this.sectionAssignmentRepository.save(assignments);

    plan.doctorId = doctorId;
    plan.status = TreatmentPlanStatus.SECTIONS_ASSIGNED;
    await this.treatmentPlanRepository.save(plan);

    const mapped = savedAssignments.map((a) => ({
      id: a.id,
      sectionType: a.sectionType,
      sectionLabel: CHAT_TYPE_LABELS[a.sectionType],
      status: a.status,
      sortOrder: a.sortOrder,
      doctorNotes: a.doctorNotes,
    }));

    await this.notificationService.createSectionAssignedNotification(
      patientId,
      doctorId,
      mapped.map((a) => ({
        id: a.id,
        sectionType: a.sectionType,
        sectionLabel: a.sectionLabel,
      })),
      plan.id,
    );

    return mapped;
  }

  async getDoctorPatients() {
    const users = await this.userRepository.find({
      where: { role: UserRole.USER },
      order: { createdAt: 'DESC' },
    });

    const results = await Promise.all(
      users.map(async (user) => {
        const status = await this.getPatientStatus(user.id);
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
          createdAt: user.createdAt,
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
          aiUsage: this.aiUsageService.toSummary(user.aiUsage),
        };
      }),
    );

    return results;
  }

  async getPatientTreatmentDetail(patientId: string) {
    const patient = await this.userRepository.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found.');

    const plan = await this.getActivePlan(patientId);
    const status = await this.getPatientStatus(patientId);

    const reports = plan
      ? await this.clinicalReportRepository.find({
          where: { treatmentPlanId: plan.id },
          order: { generatedAt: 'DESC' },
        })
      : [];

    let intakeChat: Chat | null = null;
    if (plan?.intakeChatId) {
      const foundIntakeChat = await this.chatRepository.findOne({
        where: { id: plan.intakeChatId },
        relations: ['messages'],
      });
      intakeChat = foundIntakeChat ?? null;
    }

    return {
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        dateOfBirth: patient.dateOfBirth,
      },
      plan: plan
        ? {
            id: plan.id,
            status: plan.status,
            doctorId: plan.doctorId,
            createdAt: plan.createdAt,
          }
        : null,
      intakeProgress: status.intakeProgress,
      assignments: status.assignments,
      reports: reports.map((r) => ({
        id: r.id,
        reportType: r.reportType,
        generatedAt: r.generatedAt,
        doctorId: r.doctorId,
      })),
      intakeChat,
      reportGeneratable: status.reportGeneratable,
      hasInitialReport: status.hasInitialReport,
      finalReportGeneratable: status.finalReportGeneratable,
      completionPercentage: status.completionPercentage,
      aiUsage: this.aiUsageService.toSummary(patient.aiUsage),
    };
  }

  async getPatientReports(patientId: string) {
    const plan = await this.getActivePlan(patientId);
    if (!plan) return [];

    return this.clinicalReportRepository.find({
      where: { treatmentPlanId: plan.id },
      order: { generatedAt: 'DESC' },
    });
  }

  async saveReport(
    treatmentPlanId: string,
    patientId: string,
    doctorId: string,
    reportType: ClinicalReportType,
    content: string,
  ): Promise<ClinicalReport> {
    const report = this.clinicalReportRepository.create({
      treatmentPlanId,
      patientId,
      doctorId,
      reportType,
      content,
    });
    return this.clinicalReportRepository.save(report);
  }

  async getIntakeTranscript(patientId: string): Promise<string> {
    const plan = await this.getActivePlan(patientId);
    if (!plan?.intakeChatId) {
      throw new BadRequestException('No intake chat found for patient.');
    }

    const chat = await this.chatRepository.findOne({
      where: { id: plan.intakeChatId },
      relations: ['messages'],
    });

    if (!chat?.messages?.length) {
      throw new BadRequestException('Intake chat history is empty.');
    }

    return this.buildTranscript(chat.messages);
  }

  async getFullTreatmentTranscript(patientId: string): Promise<string> {
    const plan = await this.getActivePlan(patientId);
    if (!plan) throw new BadRequestException('No active treatment plan.');

    let fullTranscript = '';

    if (plan.intakeChatId) {
      const intakeChat = await this.chatRepository.findOne({
        where: { id: plan.intakeChatId },
        relations: ['messages'],
      });
      if (intakeChat?.messages?.length) {
        fullTranscript += `## Intake Assessment\n`;
        fullTranscript += this.buildTranscript(intakeChat.messages);
        fullTranscript += '\n---\n';
      }
    }

    const assignments = await this.sectionAssignmentRepository.find({
      where: { treatmentPlanId: plan.id },
      order: { sortOrder: 'ASC' },
    });

    for (const assignment of assignments) {
      if (!assignment.chatId) continue;
      const chat = await this.chatRepository.findOne({
        where: { id: assignment.chatId },
        relations: ['messages'],
      });
      if (!chat?.messages?.length) continue;

      fullTranscript += `## ${CHAT_TYPE_LABELS[assignment.sectionType]}\n`;
      if (assignment.doctorNotes) {
        fullTranscript += `Doctor notes: ${assignment.doctorNotes}\n`;
      }
      fullTranscript += this.buildTranscript(chat.messages);
      fullTranscript += '\n---\n';
    }

    if (!fullTranscript.trim()) {
      throw new BadRequestException('No treatment history found.');
    }

    return fullTranscript;
  }

  private buildTranscript(messages: Message[]): string {
    let transcript = '';
    for (const msg of messages) {
      const role = msg.sender === MessageSender.USER ? 'Patient' : 'AI Therapist';
      transcript += `${role}: ${msg.content}\n`;
    }
    return transcript;
  }

  async validateInitialReportEligible(patientId: string): Promise<TreatmentPlan> {
    const plan = await this.getActivePlan(patientId);
    if (!plan) throw new BadRequestException('No active treatment plan.');

    const status = await this.getPatientStatus(patientId);
    if (!status.reportGeneratable) {
      throw new BadRequestException(
        `Intake requires ${INTAKE_USER_MESSAGE_LIMIT} user messages before report generation.`,
      );
    }

    return plan;
  }

  async validateFinalReportEligible(patientId: string): Promise<TreatmentPlan> {
    const plan = await this.getActivePlan(patientId);
    if (!plan) throw new BadRequestException('No active treatment plan.');

    const status = await this.getPatientStatus(patientId);
    if (!status.finalReportGeneratable) {
      throw new BadRequestException(
        'All assigned sections must be completed before generating the final report.',
      );
    }

    return plan;
  }
}
