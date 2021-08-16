import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { UserProfileOutput } from './dtos/user-profile';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    //private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {
    //console.log(this.config.get('SECRET_KEY'));
    //console.log(this.jwtService.hello());
  }

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    /* 
      1. email 체크 
      2. createUser
      3. hash password
    */
    try {
      const exists = await this.users.findOne({ email }); // email이랑 동일한 user 찾기
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      } else {
        const user = await this.users.save(
          this.users.create({ email, password, role }),
        );
        // users.create는 그냥 entity를 생성만 함, save 하기 전,  @BeforeInsert()를 통해서 hashPassword()
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        await this.sendMail('hi', 'shegoback@naver.com', verification.code);
        return { ok: true };
      }
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: "couldn't create account",
      };
    }
  }
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    /* 
      1. 같은 email user 찾기.
      2. password check
      3. jwt 토큰 만들기
    */

    try {
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }

      const passwordChk = await user.checkPasswrod(password);
      if (!passwordChk) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      } else {
        const token = this.jwtService.sign(user.id);
        return { ok: true, token };
      }
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOne({ id });
      if (user) {
        return {
          ok: true,
          user: user,
        };
      }
    } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
  }

  async editProfile(
    userId: number,
    { password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: 'Could not update profile.' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
        /*  { loadEagerRelations: true }, */
      );
      if (verification) {
        console.log(verification);
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return { ok: true };
        /* 
          users.save를 하면 beforeUpdate 때문에 password가 hash가 되어버림  
        */
      }
      return { ok: false, error: 'Verification not Found.' };
    } catch (error) {
      console.log(error);
      return { ok: false, error };
    }
  }

  async sendMail(subject: string, to: string, code: string) {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: subject,
        html: '<a href=""><b>' + code + '</b></a>',
      });
      return true;
    } catch (error) {
      console.log('email', error);
      return false;
    }
  }
}
