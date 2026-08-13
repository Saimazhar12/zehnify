import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { TreatmentPlanStatus } from '../constants/treatment-plan-status.enum';
import { SectionAssignment } from './section-assignment.entity';
import { ClinicalReport } from './clinical-report.entity';

@Entity('treatment_plans')
export class TreatmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: User;

  @Column({ type: 'uuid', nullable: true })
  doctorId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: User | null;

  @Column({
    type: 'enum',
    enum: TreatmentPlanStatus,
    default: TreatmentPlanStatus.INTAKE_IN_PROGRESS,
  })
  status: TreatmentPlanStatus;

  @Column({ type: 'uuid', nullable: true })
  intakeChatId: string | null;

  @OneToMany(() => SectionAssignment, (assignment) => assignment.treatmentPlan)
  sectionAssignments: SectionAssignment[];

  @OneToMany(() => ClinicalReport, (report) => report.treatmentPlan)
  reports: ClinicalReport[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
