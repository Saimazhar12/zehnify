import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TreatmentModule } from '../treatment/treatment.module';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [TypeOrmModule.forFeature([User]), TreatmentModule, AiModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }
