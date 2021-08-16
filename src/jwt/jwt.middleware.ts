import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  /* jwt module은 global이니까 쉽게 찾을 수 잇음, jwtService는 module에서 export 하고 있음 
    userService도 export 해야 함
  */
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      /* decoded 안에 id의 property가 있으면 */
      try {
        const decoded = this.jwtService.verify(token.toString());
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          console.log(decoded['id']);
          const user = await this.userService.findById(decoded['id']);
          req['user'] = user;
          /* graphql로 request를 공유 -> graphql resolver에 전달 해야함 apollo-server에서 context 사용 request마다 실행됨*/
        }
      } catch (error) {}
    }
    next();
  }
}
