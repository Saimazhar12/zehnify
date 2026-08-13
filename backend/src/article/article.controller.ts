import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/create-article.dto';
import { AtGuard, RolesGuard } from '../common/guards';
import { GetCurrentUserId } from '../common/decorators';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';

@UseGuards(AtGuard)
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  findAllPublished() {
    return this.articleService.findAllPublished();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Get('mine')
  findMine(@GetCurrentUserId() authorId: string) {
    return this.articleService.findMine(authorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOnePublished(id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @GetCurrentUserId() authorId: string,
    @Body() dto: CreateArticleDto,
  ) {
    return this.articleService.create(authorId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Patch(':id')
  update(
    @GetCurrentUserId() authorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.articleService.update(authorId, id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @GetCurrentUserId() authorId: string,
    @Param('id') id: string,
  ) {
    return this.articleService.remove(authorId, id);
  }
}
