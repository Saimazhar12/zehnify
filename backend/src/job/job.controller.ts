import { Controller, Post, Body } from '@nestjs/common';
import { JobService } from './job.producer';

@Controller('jobs')
export class JobController {
    constructor(private readonly jobService: JobService) { }

    @Post('email')
    async sendEmail(@Body() body: { to: string, subject: string, body: string }) {
        return this.jobService.sendEmail(body.to, body.subject, body.body);
    }
}
