import { Controller, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserRole } from './user.entity';
import { AtGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';
import { AiUsageService } from '../ai/ai-usage.service';

@UseGuards(AtGuard, RolesGuard)
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly aiUsageService: AiUsageService,
    ) { }

    @Get('me/ai-usage')
    @Roles(UserRole.ADMIN, UserRole.DOCTOR)
    async getMyAiUsage(@GetCurrentUserId() userId: string) {
        return this.aiUsageService.getUserUsage(userId);
    }

    @Get(':id/ai-usage')
    @Roles(UserRole.ADMIN, UserRole.DOCTOR)
    async getUserAiUsage(@Param('id') id: string) {
        return this.aiUsageService.getUserUsage(id);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    async findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    async update(
        @Param('id') id: string,
        @Body() updateData: Partial<User>
    ): Promise<User> {
        return this.userService.update(id, updateData);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Param('id') id: string): Promise<void> {
        return this.userService.remove(id);
    }
}
