import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class GetCurrentUserDecorator {
    // This is just a placeholder class to be replaced by the function below
}

export const GetCurrentUser = createParamDecorator(
    (data: string | undefined, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        if (!data) return request.user;
        return request.user[data];
    },
);
