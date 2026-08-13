import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { SignupDto } from './dto/signup.dto';
import { AuthDto } from './dto/auth.dto';
import { AuthResponse } from './types';
import { JobService } from '../job/job.producer';
import { UserRole } from '../user/user.entity';
import { getFrontendUrl } from '../common/constants/app-urls';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private jobService: JobService,
    ) { }

    async signupLocal(dto: SignupDto): Promise<AuthResponse> {
        const existingUser = await this.userService.findByEmail(dto.email);
        if (existingUser) throw new BadRequestException('User already exists');

        const hash = await this.hashData(dto.password);
        const newUser = await this.userService.create({
            email: dto.email,
            passwordHash: hash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: UserRole.USER,
            dateOfBirth: dto.dateOfBirth,
            acceptedTermsAt: new Date(),
        });

        const access_token = await this.createAccessToken(
            newUser.id,
            newUser.email,
            newUser.role,
        );

        await this.queueWelcomeEmail(newUser.email, newUser.firstName);

        return {
            access_token,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
            },
        };
    }

    async signinLocal(dto: AuthDto): Promise<AuthResponse> {
        const user = await this.userService.findByEmail(dto.email);
        if (!user) throw new ForbiddenException('Access Denied');

        const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatches) throw new ForbiddenException('Access Denied');

        const access_token = await this.createAccessToken(
            user.id,
            user.email,
            user.role,
        );

        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        };
    }

    async logout(_userId: string): Promise<void> {
        // Stateless JWT — client discards the access token.
    }

    async validateGoogleUser(details: {
        email: string;
        firstName: string;
        lastName: string;
        googleId: string;
        picture: string;
    }): Promise<AuthResponse> {
        if (!details.email.endsWith('@umt.edu.pk')) {
            throw new ForbiddenException(
                'Only UMT email addresses (@umt.edu.pk) are allowed.',
            );
        }

        let user = await this.userService.findByEmail(details.email);

        if (user) {
            await this.userService.update(user.id, { googleId: details.googleId });
        } else {
            user = await this.userService.create({
                email: details.email,
                firstName: details.firstName,
                lastName: details.lastName,
                googleId: details.googleId,
                role: UserRole.USER,
                acceptedTermsAt: new Date(),
            });

            await this.queueWelcomeEmail(user.email, user.firstName);
        }

        const access_token = await this.createAccessToken(
            user.id,
            user.email,
            user.role,
        );

        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        };
    }

    hashData(data: string) {
        return bcrypt.hash(data, 10);
    }

    private async queueWelcomeEmail(email: string, firstName: string) {
        const frontendUrl = getFrontendUrl(this.configService);

        try {
            await this.jobService.sendWelcomeEmail(email, firstName, `${frontendUrl}/app`);
        } catch (error) {
            console.error('Failed to queue welcome email:', error);
        }
    }

    private async createAccessToken(
        userId: string,
        email: string,
        role: string,
    ): Promise<string> {
        return this.jwtService.signAsync(
            {
                sub: userId,
                email,
                role,
            },
            {
                secret: this.configService.get<string>('AT_SECRET'),
                expiresIn: '1d',
            },
        );
    }
}
