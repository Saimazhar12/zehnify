import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';

export enum ArticleType {
  ARTICLE = 'article',
  GUIDE = 'guide',
}

@Entity('wellness_articles')
export class WellnessArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 500 })
  excerpt: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: ArticleType,
    default: ArticleType.ARTICLE,
  })
  type: ArticleType;

  @Column({ type: 'int', default: 5 })
  readTimeMinutes: number;

  @Column({ default: true })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
