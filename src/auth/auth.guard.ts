/* guard는 function인데, request를 다음단계로 진행할지 말지 결정(middleware - next()) */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /* true를 return을 하면 request next(), false면 stop */
  canActivate(context: ExecutionContext) {
    console.log('context', context);
    /* metadata 찾기, */
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    ); // role.decorator -> AllowedRoles
    console.log('role', roles);
    if (!roles) {
      /* resolver에 metadata가 없다면 public  canActivate는 true */
      return true;
    }
    /* 로그인 유/무 찾기 */
    const gqlContext = GqlExecutionContext.create(context).getContext(); // execution context를 가져올 뿐만 아니라, metadata 가져옴
    console.log('gqlContext', gqlContext);
    const user: User = gqlContext['user'];
    if (!user) {
      /* resolver에 metadata가 있는데, user가 로그인 되어 있지 않으면, canActivate는 false */
      return false;
    }
    if (roles.includes('Any')) {
      /* resolver에 metadata가 있고, user가 로그인 되어 있고,roles에 any가 있으면 canActivate는 ture */
      return true;
    }
    return roles.includes(user.role);
  }
}
