import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobController } from './job.controller';
import { JobService } from './job.producer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailProcessor } from './job.processor';

function getRedisConnection(redisUrl: string) {
    const url = new URL(redisUrl);

    return {
        host: url.hostname,
        port: parseInt(url.port || '6379', 10),
        username: url.username || undefined,
        password: url.password ? decodeURIComponent(url.password) : undefined,
        tls: url.protocol === 'rediss:' ? {} : undefined,
        maxRetriesPerRequest: null,
    };
}

@Module({
    imports: [
        ConfigModule,
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                connection: getRedisConnection(
                    configService.getOrThrow<string>('REDIS_URL'),
                ),
            }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: 'email-queue',
        }),
    ],
    controllers: [JobController],
    providers: [JobService, EmailProcessor],
    exports: [JobService],
})
export class JobModule { }
