import {
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ArticleType,
  WellnessArticle,
} from './entities/wellness-article.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto/create-article.dto';
import { User, UserRole } from '../user/user.entity';

const SEED_ARTICLES: Array<{
  title: string;
  excerpt: string;
  content: string;
  type: ArticleType;
  readTimeMinutes: number;
}> = [
  {
    title: 'Understanding Anxiety',
    excerpt: 'Learn what anxiety is, how it shows up in the body, and practical ways to respond with compassion.',
    type: ArticleType.ARTICLE,
    readTimeMinutes: 5,
    content: `Anxiety is one of the most common emotional experiences people face. It is not a personal failure — it is your nervous system trying to protect you from perceived threat.

**What anxiety feels like**
You might notice a racing heart, tight chest, restless thoughts, or difficulty sleeping. These sensations are uncomfortable, but they are temporary signals, not permanent truths about who you are.

**Common triggers**
Academic pressure, social situations, uncertainty about the future, and past difficult experiences can all activate anxiety. Identifying your personal triggers is the first step toward managing them.

**Helpful strategies**
- Practice slow breathing: inhale for 4 counts, hold for 4, exhale for 6.
- Ground yourself using the 5-4-3-2-1 technique (name things you see, hear, feel, smell, taste).
- Limit caffeine when you are already feeling on edge.
- Talk to someone you trust — connection reduces isolation.

**When to seek support**
If anxiety interferes with sleep, concentration, or daily activities for more than a few weeks, reach out to a counselor or doctor. Professional support can make a meaningful difference.`,
  },
  {
    title: 'Deep Breathing 101',
    excerpt: 'A step-by-step guide to calming your nervous system through intentional breathing.',
    type: ArticleType.GUIDE,
    readTimeMinutes: 10,
    content: `Breathing is the fastest way to communicate safety to your body. When you breathe slowly and deeply, you activate the parasympathetic nervous system — your body's natural "rest and digest" mode.

**Why breathing works**
Shallow, rapid breathing keeps your body in alert mode. Deliberate slow breathing sends a signal that the danger has passed, even when your mind still feels worried.

**Box breathing (4-4-4-4)**
1. Inhale through your nose for 4 seconds.
2. Hold your breath for 4 seconds.
3. Exhale through your mouth for 4 seconds.
4. Hold empty for 4 seconds.
Repeat for 4–6 cycles.

**Diaphragmatic breathing**
Place one hand on your chest and one on your belly. Breathe so only the lower hand rises. This engages the diaphragm and promotes fuller oxygen exchange.

**When to practice**
Use breathing exercises before exams, difficult conversations, or whenever you notice tension building. Even 2 minutes can shift your state noticeably.

**Tip for beginners**
Do not force perfection. If counting feels stressful, simply focus on making your exhale longer than your inhale.`,
  },
  {
    title: 'Sleep Hygiene Guide',
    excerpt: 'Evidence-based habits to improve sleep quality and wake up feeling more rested.',
    type: ArticleType.ARTICLE,
    readTimeMinutes: 7,
    content: `Good sleep is foundational to mental health. Poor sleep worsens anxiety, low mood, and difficulty concentrating — while consistent rest supports emotional resilience.

**Set a consistent schedule**
Go to bed and wake up at roughly the same time every day, including weekends. Your body thrives on rhythm.

**Create a wind-down routine**
Begin dimming lights 30–60 minutes before bed. Avoid intense study, arguments, or stimulating content right before sleep.

**Optimize your environment**
Keep your room cool, dark, and quiet. If noise is unavoidable, try white noise or earplugs.

**Limit screens before bed**
Blue light suppresses melatonin. Try reading, stretching, or journaling instead of scrolling.

**Watch caffeine and meals**
Avoid caffeine after mid-afternoon. Heavy meals close to bedtime can disrupt digestion and sleep.

**If you cannot fall asleep**
Get out of bed after 20 minutes. Do something calm in low light, then return when sleepy. This prevents your brain from associating bed with frustration.`,
  },
  {
    title: 'Mindfulness Basics',
    excerpt: 'Introduction to present-moment awareness and how it supports emotional wellbeing.',
    type: ArticleType.GUIDE,
    readTimeMinutes: 15,
    content: `Mindfulness is the practice of paying attention to the present moment with openness and without harsh judgment. It is not about emptying your mind — it is about noticing what is here, right now.

**Core principles**
- **Present moment:** Focus on now, not yesterday's regrets or tomorrow's worries.
- **Non-judgment:** Observe thoughts and feelings without labeling them good or bad.
- **Patience:** Progress comes with gentle repetition, not force.

**Simple mindfulness exercise**
Sit comfortably. Close your eyes or soften your gaze. Notice your breath — the sensation of air entering and leaving. When your mind wanders (it will), gently return attention to the breath without criticizing yourself.

**Body scan (5 minutes)**
Move attention slowly from your toes to the top of your head. Notice sensations in each area: warmth, tension, tingling, or nothing at all. Simply observe.

**Mindful walking**
Feel your feet contact the ground. Notice the rhythm of your steps. This is especially helpful between classes or during study breaks.

**Common misconceptions**
Mindfulness is not religious, and you do not need to meditate for hours. Even 3–5 minutes daily can reduce stress over time.

**Building a habit**
Anchor mindfulness to something you already do — after brushing teeth, before opening your laptop, or during your first sip of morning tea.`,
  },
];

@Injectable()
export class ArticleService implements OnModuleInit {
  constructor(
    @InjectRepository(WellnessArticle)
    private readonly articleRepository: Repository<WellnessArticle>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.articleRepository.count();
    if (count > 0) return;

    const author = await this.userRepository.findOne({
      where: [{ role: UserRole.DOCTOR }, { role: UserRole.ADMIN }],
      order: { createdAt: 'ASC' },
    });

    if (!author) return;

    for (const seed of SEED_ARTICLES) {
      const article = this.articleRepository.create({
        ...seed,
        authorId: author.id,
        published: true,
      });
      await this.articleRepository.save(article);
    }
  }

  async findAllPublished() {
    const articles = await this.articleRepository.find({
      where: { published: true },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    return articles.map((article) => this.toListResponse(article));
  }

  async findOnePublished(id: string) {
    const article = await this.articleRepository.findOne({
      where: { id, published: true },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('Article not found.');
    }

    return this.toDetailResponse(article);
  }

  async findMine(authorId: string) {
    const articles = await this.articleRepository.find({
      where: { authorId },
      relations: ['author'],
      order: { updatedAt: 'DESC' },
    });

    return articles.map((article) => this.toListResponse(article));
  }

  async create(authorId: string, dto: CreateArticleDto) {
    const article = this.articleRepository.create({
      authorId,
      title: dto.title.trim(),
      excerpt: dto.excerpt.trim(),
      content: dto.content.trim(),
      type: dto.type ?? ArticleType.ARTICLE,
      readTimeMinutes: dto.readTimeMinutes ?? this.estimateReadTime(dto.content),
      published: dto.published ?? true,
    });

    const saved = await this.articleRepository.save(article);
    return this.findOneForAuthor(saved.id, authorId);
  }

  async update(authorId: string, articleId: string, dto: UpdateArticleDto) {
    const article = await this.getOwnedArticle(authorId, articleId);

    if (dto.title !== undefined) article.title = dto.title.trim();
    if (dto.excerpt !== undefined) article.excerpt = dto.excerpt.trim();
    if (dto.content !== undefined) article.content = dto.content.trim();
    if (dto.type !== undefined) article.type = dto.type;
    if (dto.readTimeMinutes !== undefined) article.readTimeMinutes = dto.readTimeMinutes;
    if (dto.published !== undefined) article.published = dto.published;

    await this.articleRepository.save(article);
    return this.findOneForAuthor(articleId, authorId);
  }

  async remove(authorId: string, articleId: string) {
    const article = await this.getOwnedArticle(authorId, articleId);
    await this.articleRepository.remove(article);
    return { deleted: true };
  }

  private async findOneForAuthor(id: string, authorId: string) {
    const article = await this.articleRepository.findOne({
      where: { id, authorId },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('Article not found.');
    }

    return this.toDetailResponse(article);
  }

  private async getOwnedArticle(authorId: string, articleId: string) {
    const article = await this.articleRepository.findOne({
      where: { id: articleId, authorId },
    });

    if (!article) {
      throw new NotFoundException('Article not found.');
    }

    return article;
  }

  private estimateReadTime(content: string): number {
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  private toAuthorResponse(author: User) {
    return {
      id: author.id,
      firstName: author.firstName,
      lastName: author.lastName,
    };
  }

  private toListResponse(article: WellnessArticle) {
    return {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      type: article.type,
      readTimeMinutes: article.readTimeMinutes,
      published: article.published,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      author: article.author ? this.toAuthorResponse(article.author) : null,
    };
  }

  private toDetailResponse(article: WellnessArticle) {
    return {
      ...this.toListResponse(article),
      content: article.content,
    };
  }
}
