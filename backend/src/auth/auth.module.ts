import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JobModule } from '../job/job.module';
import { AtStrategy, GoogleStrategy } from './strategies';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

@Module({
    imports: [
        UserModule,
        PassportModule,
        JwtModule.register({}),
        JobModule,
    ],
    providers: [AuthService, AtStrategy, GoogleStrategy, GoogleOAuthGuard],
    controllers: [AuthController],
})
export class AuthModule { }
