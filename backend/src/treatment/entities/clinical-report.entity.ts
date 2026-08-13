import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClinicalReportType } from '../constants/clinical-report-type.enum';
import { TreatmentPlan } from './treatment-plan.entity';
import { User } from '../../user/user.entity';

@Entity('clinical_reports')
export class ClinicalReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  treatmentPlanId: string;

  @ManyToOne(() => TreatmentPlan, (plan) => plan.reports, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'treatmentPlanId' })
  treatmentPlan: TreatmentPlan;

  @Column()
  patientId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: User;

  @Column()
  doctorId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @Column({
    type: 'enum',
    enum: ClinicalReportType,
  })
  reportType: ClinicalReportType;

  @Column('text')
  content: string;

  @CreateDateColumn()
  generatedAt: Date;
}
