import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/signup.dto';
import { AuthDto } from './dto/auth.dto';
import { AuthResponse } from './types';
import type { Response } from 'express';
import { AtGuard } from '../common/guards';
import { GetCurrentUserId } from '../common/decorators';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { getFrontendUrl } from '../common/constants/app-urls';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) { }

    @Post('local/signup')
    @HttpCode(HttpStatus.CREATED)
    signupLocal(@Body() dto: SignupDto): Promise<AuthResponse> {
        return this.authService.signupLocal(dto);
    }

    @Post('local/signin')
    @HttpCode(HttpStatus.OK)
    signinLocal(@Body() dto: AuthDto): Promise<AuthResponse> {
        return this.authService.signinLocal(dto);
    }

    @UseGuards(GoogleOAuthGuard)
    @Get('google')
    @HttpCode(HttpStatus.OK)
    googleAuth() {
        // Initiates the Google OAuth2 login flow
    }

    @UseGuards(GoogleOAuthGuard)
    @Get('google/callback')
    googleAuthRedirect(@Req() req, @Res() res: Response) {
        const auth = req.user as AuthResponse | undefined;
        const frontendUrl = getFrontendUrl(this.configService);

        if (!auth?.access_token || !auth?.user) {
            return res.redirect(
                `${frontendUrl}/login?error=${encodeURIComponent('Google sign-in failed. Please try again.')}`,
            );
        }

        const { access_token, user } = auth;
        const redirectPath =
            user.role === 'doctor' ? '/doctor' : user.role === 'admin' ? '/admin' : '/app';

        const payload = Buffer.from(
            JSON.stringify({ access_token, user, redirectPath }),
            'utf8',
        ).toString('base64url');

        return res.redirect(`${frontendUrl}/auth/google/callback#${payload}`);
    }

    @UseGuards(AtGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@GetCurrentUserId() userId: string): Promise<void> {
        return this.authService.logout(userId);
    }
}
