import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('redis-test')
  async testRedis(): Promise<string> {
    await this.redisService.set('test_key', 'Hello Redis', 60);
    const value = await this.redisService.get('test_key');
    return `Redis value: ${value}`;
  }
}
