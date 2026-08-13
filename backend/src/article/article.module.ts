import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WellnessArticle } from './entities/wellness-article.entity';
import { User } from '../user/user.entity';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WellnessArticle, User])],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
