import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

type JwtRequestUser = { userId: string };

export const CurrentUserId = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user as JwtRequestUser | undefined;

  if (!user?.userId) {
    throw new UnauthorizedException('Invalid token payload');
  }

  return user.userId;
});
