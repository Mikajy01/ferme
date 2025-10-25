import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { IUserRepository } from 'src/modules/users/interfaces/user.repository.interface';

@Injectable()
export class InternalUserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async findUserBySession(session: string) {
    return this.userRepository.findBySession(session);
  }

  async validatePassword(
    user: Partial<UserEntity>,
    password: string,
  ): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(password, user.password);
  }
}
