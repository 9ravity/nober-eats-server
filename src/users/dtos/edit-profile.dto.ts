import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core-output.dto';
import { User } from '../entities/user.entity';

/* User Class에서 몇개의 property만 선택 PickType */
//export class EditProfileInput extends PickType(User, ['email', 'password']) {}

/* PartialType Optional 하게 만듬 */
@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['password']),
) {}

@ObjectType()
export class EditProfileOutput extends CoreOutput {}
