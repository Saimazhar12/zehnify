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
import { Message } from './message.entity';
import { ChatType } from '../constants/chat-type.enum';
import { ChatStatus } from '../constants/chat-status.enum';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.chats, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'int' })
  type: ChatType;

  @Column({
    type: 'enum',
    enum: ChatStatus,
    default: ChatStatus.ACTIVE,
  })
  status: ChatStatus;

  @Column({ type: 'uuid', nullable: true })
  treatmentPlanId: string | null;

  @Column({ type: 'uuid', nullable: true })
  sectionAssignmentId: string | null;

  @Column({ default: 'New Chat' })
  title: string;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
