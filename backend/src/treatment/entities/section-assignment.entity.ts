import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatType } from '../../chat/constants/chat-type.enum';
import { SECTION_USER_MESSAGE_LIMIT } from '../../chat/constants/chat-type.enum';
import { SectionAssignmentStatus } from '../constants/section-assignment-status.enum';
import { TreatmentPlan } from './treatment-plan.entity';

@Entity('section_assignments')
export class SectionAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  treatmentPlanId: string;

  @ManyToOne(() => TreatmentPlan, (plan) => plan.sectionAssignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'treatmentPlanId' })
  treatmentPlan: TreatmentPlan;

  @Column({ type: 'int' })
  sectionType: ChatType;

  @Column({ type: 'uuid', nullable: true })
  chatId: string | null;

  @Column({
    type: 'enum',
    enum: SectionAssignmentStatus,
    default: SectionAssignmentStatus.ASSIGNED,
  })
  status: SectionAssignmentStatus;

  @Column({ type: 'int', default: SECTION_USER_MESSAGE_LIMIT })
  requiredUserMessages: number;

  @Column({ type: 'int' })
  sortOrder: number;

  @Column({ type: 'text', nullable: true })
  doctorNotes: string | null;

  @CreateDateColumn()
  assignedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;
}
