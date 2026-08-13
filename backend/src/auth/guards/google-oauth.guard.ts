import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { getFrontendUrl } from '../../common/constants/app-urls';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  getAuthenticateOptions(_context: ExecutionContext) {
    const frontendUrl = getFrontendUrl(this.configService);

    return {
      session: false,
      failureRedirect: `${frontendUrl}/login?error=${encodeURIComponent(
        'Google sign-in failed. Please try again.',
      )}`,
    };
  }
}
