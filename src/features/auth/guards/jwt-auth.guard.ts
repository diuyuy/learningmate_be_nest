import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/common/api-response/response-status';
import { PASSPORT_STRATEGY_NAME } from 'src/common/constants/passport-strategy-name';
import { CommonException } from 'src/common/exception/common-exception';
import { IS_PUBLIC_KEY } from '../decorators/public';

@Injectable()
export class JwtAuthGuard extends AuthGuard(PASSPORT_STRATEGY_NAME.JWT) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest<MemberInfo>(err: any, user: MemberInfo) {
    if (err || !user) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.UNAUTHORIZED),
      );
    }

    return user;
  }
}
