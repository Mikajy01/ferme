import { ConflictException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { CreateUserDto } from '../dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) { }

  async findAll(query: any, currentUser: any) {
    const { role, isActive, search, page, limit } = query;

    const where = {
      ...(Array.isArray(role) && { role: { in: role } }),
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { session: { contains: search } },
        ],
      }),
      idUser: { not: currentUser?.userId },
    };

    if (page && limit) {
      const { total, data } = await this.userRepository.findAllWithPagination(where, page, limit);
      const totalPages = page && limit ? Math.ceil(total / limit) : undefined;

      return {
        page,
        limit,
        total,
        totalPages,
        data,
      };
    } else {
      const { total, data } = await this.userRepository.findAll(where);

      return {
        total,
        data,
      };
    }

  }

  async findById(idUtilisateur: string) {
    return this.userRepository.findById(idUtilisateur)
  }

  async create(dto: CreateUserDto) {
    const existingUser = await this.userRepository.findBySession(dto.session);
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cette session existe déjà.');
    }

    return this.userRepository.createUser(dto);
  }

  async update(id: string, dto: CreateUserDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Aucun utilisateur trouvé pour la session ${id}`);
    }
    return this.userRepository.updateUser(id, dto);
  }

  async updateStatusBySession(session: string, isActive: boolean) {
    const user = await this.userRepository.findBySession(session);
    if (!user) {
      throw new NotFoundException(`Aucun utilisateur trouvé pour la session ${session}`);
    }
    return this.userRepository.updateStatusBySession(session, isActive);
  }

  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ isActive: true });
    const inactiveUsers = totalUsers - activeUsers;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
    };
  }
}
