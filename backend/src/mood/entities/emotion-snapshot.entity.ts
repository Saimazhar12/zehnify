import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { Chat } from '../../chat/entities/chat.entity';

@Entity('emotion_snapshots')
@Index(['chatId', 'createdAt'])
@Index(['userId', 'createdAt'])
export class EmotionSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  chatId: string;

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column({ type: 'uuid', nullable: true })
  treatmentPlanId: string | null;

  @Column({ type: 'uuid', nullable: true })
  sectionAssignmentId: string | null;

  @Column({ type: 'boolean' })
  accepted: boolean;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  prediction: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 6, nullable: true })
  confidence: number | null;

  @Column({ type: 'jsonb', nullable: true })
  allEmotions: Record<string, number> | null;

  @Column({ type: 'int', nullable: true })
  sequenceNumber: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
