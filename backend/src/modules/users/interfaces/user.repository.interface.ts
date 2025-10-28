import { CreateUserDto } from '../dtos/create-user.dto';
import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findAllWithPagination(
    filters: any,
    page?: number,
    limit?: number,
  ): Promise<{
    data: UserEntity[];
    total: number;
  }>;

  findAll(filters: any): Promise<{
    data: UserEntity[];
    total: number;
  }>;

  findBySession(session: string): Promise<UserEntity | null>;

  findById(id: string): Promise<UserEntity | null>;

  createUser(data: CreateUserDto): Promise<UserEntity>;

  updateUser(id: string, data: CreateUserDto): Promise<UserEntity>;

  updateStatusBySession(
    session: string,
    isActive: boolean,
  ): Promise<UserEntity>;

  count(where?: any): Promise<number>;
}
