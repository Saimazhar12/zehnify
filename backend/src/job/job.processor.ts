import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
    private readonly logger = new Logger(EmailProcessor.name);
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        super();
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT'),
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASS'),
            },
        });
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.debug(`Processing job ${job.id} of type ${job.name}`);

        await this.sendEmail(
            job.data.to,
            job.data.subject,
            job.data.html,
            job.data.body,
        );

        this.logger.debug(`Email sent to ${job.data.to}`);
        return {};
    }

    private async sendEmail(
        to: string,
        subject: string,
        html?: string,
        body?: string,
    ) {
        const emailHtml = html ?? `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f6f6; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background-color: #4A90E2; padding: 20px; text-align: center; color: #ffffff; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 30px; color: #333333; line-height: 1.6; }
                    .footer { background-color: #f6f6f6; padding: 20px; text-align: center; font-size: 12px; color: #999999; }
                    .button { display: inline-block; background-color: #4A90E2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Zehnify</h1>
                    </div>
                    <div class="content">
                        <p>${body ?? ''}</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Zehnify. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await this.transporter.sendMail({
            from: this.configService.get<string>('MAIL_FROM') || '"Zehnify" <no-reply@zehnify.com>',
            to,
            subject,
            html: emailHtml,
        });
    }
}
