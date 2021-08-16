/* guard는 function인데, request를 다음단계로 진행할지 말지 결정(middleware - next()) */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  /* true를 return을 하면 request next(), false면 stop */
  canActivate(context: ExecutionContext) {
    console.log(context);
    const gqlContext = GqlExecutionContext.create(context).getContext();
    console.log(gqlContext);
    const user = gqlContext['user'];
    if (!user) {
      return false;
    }
    return true;
  }
}
