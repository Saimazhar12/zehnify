import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { getGoogleCallbackUrl } from '../../common/constants/app-urls';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            clientID: configService.getOrThrow('GOOGLE_CLIENT_ID'),
            clientSecret: configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
            callbackURL: getGoogleCallbackUrl(configService),
            scope: ['email', 'profile'],
            state: false,
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<void> {
        try {
            const { name, emails, photos } = profile;
            const email = emails?.[0]?.value;

            if (!email) {
                done(new Error('Google account has no email address.'), undefined);
                return;
            }

            const displayName = (profile.displayName as string) || 'User';
            const nameParts = displayName.trim().split(/\s+/);

            const user = await this.authService.validateGoogleUser({
                email,
                firstName: name?.givenName || nameParts[0] || 'User',
                lastName: name?.familyName || nameParts.slice(1).join(' ') || '',
                picture: photos?.[0]?.value || '',
                googleId: profile.id,
            });
            done(null, user);
        } catch (error) {
            done(error as Error, undefined);
        }
    }
}
