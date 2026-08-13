import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Chat } from './chat.entity';

export enum MessageSender {
    USER = 'user',
    AI = 'ai',
}

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
    chat: Chat;

    @Column()
    chatId: string;

    @Column({
        type: 'enum',
        enum: MessageSender,
    })
    sender: MessageSender;

    @Column('text')
    content: string;

    @CreateDateColumn()
    createdAt: Date;
}
