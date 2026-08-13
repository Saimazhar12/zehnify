import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { buildWelcomeEmailHtml } from './templates/welcome-email.template';

@Injectable()
export class JobService {
    constructor(@InjectQueue('email-queue') private emailQueue: Queue) { }

    async sendEmail(to: string, subject: string, body: string) {
        await this.emailQueue.add('send-email', {
            to,
            subject,
            body,
        });
        return { message: 'Email job added to queue', to };
    }

    async sendWelcomeEmail(
        to: string,
        firstName: string,
        frontendUrl: string,
    ) {
        const html = buildWelcomeEmailHtml({ firstName, frontendUrl });

        await this.emailQueue.add('send-email', {
            to,
            subject: 'Welcome to Zehnify!',
            html,
        });

        return { message: 'Welcome email queued', to };
    }
}
