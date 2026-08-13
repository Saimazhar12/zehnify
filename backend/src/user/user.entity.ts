import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserAiUsage } from '../ai/types/ai-usage.types';

export enum UserRole {
    DOCTOR = 'doctor',
    USER = 'user',
    ADMIN = 'admin',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    passwordHash: string;

    @Column({ nullable: true })
    googleId: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({ type: 'date', nullable: true })
    dateOfBirth: Date;

    @Column({ type: 'timestamptz', nullable: true })
    acceptedTermsAt: Date | null;

    @Column({ type: 'varchar', nullable: true })
    hashedRefreshToken: string | null;

    @Column({ type: 'jsonb', nullable: true })
    aiUsage: UserAiUsage | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany('Chat', 'user')
    chats: any[];
}
