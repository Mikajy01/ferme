import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from 'src/common/enums/roles.enum';
import { UtilisateursService } from 'src/modules/utilistaeurs/services/users.service';
import { IUserRepository } from 'src/modules/utilistaeurs/interfaces/user.repository.interface';
import { CreateUserDto } from 'src/modules/utilistaeurs/dtos/create-user.dto';

describe('UtilisateursService', () => {
  let service: UtilisateursService;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser = {
    idUtilisateur: '1',
    session: 'test-session',
    nomComplet: 'Test User',
    email: 'test@example.com',
    role: Role.AGENT,
    agenceCode: 'AG001',
    poste: 'Agent',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    password: null,
    authType: 'ldap',
  };

  const mockCurrentUser = { userId: '2', role: Role.ADMIN };

  beforeEach(async () => {
    const mockRepository = {
      findAllWithPagination: jest.fn(),
      findById: jest.fn(),
      findBySession: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      updateStatusBySession: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UtilisateursService,
        { provide: 'IUserRepository', useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UtilisateursService>(UtilisateursService);
    userRepository = module.get('IUserRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users with filters', async () => {
      const query = { role: [Role.AGENT], page: 1, limit: 10, search: 'test' };
      const mockResult = { total: 1, data: [mockUser] };

      userRepository.findAllWithPagination.mockResolvedValue(mockResult);

      const result = await service.findAll(query, mockCurrentUser);

      expect(userRepository.findAllWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({
          role: { in: [Role.AGENT] },
          OR: expect.any(Array),
          idUtilisateur: { not: '2' },
        }),
        1,
        10,
      );
      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        data: [mockUser],
      });
    });

    it('should handle query without pagination', async () => {
      const query = { search: 'test' };
      const mockResult = { total: 1, data: [mockUser] };

      userRepository.findAllWithPagination.mockResolvedValue(mockResult);

      const result = await service.findAll(query, mockCurrentUser);

      expect(result.totalPages).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('1');

      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createDto: CreateUserDto = {
        session: 'new-session',
        nomComplet: 'New User',
        email: 'new@example.com',
        role: Role.AGENT,
        agenceCode: 'AG002',
        poste: 'Agent',
        isActive: true,
      };

      userRepository.findBySession.mockResolvedValue(null);
      userRepository.createUser.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(userRepository.findBySession).toHaveBeenCalledWith('new-session');
      expect(userRepository.createUser).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if session already exists', async () => {
      const createDto: CreateUserDto = {
        session: 'existing-session',
        nomComplet: 'New User',
        email: 'new@example.com',
        role: Role.AGENT,
        agenceCode: 'AG002',
        poste: 'Agent',
        isActive: true,
      };

      userRepository.findBySession.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update existing user', async () => {
      const updateDto: CreateUserDto = {
        session: 'updated-session',
        nomComplet: 'Updated User',
        email: 'updated@example.com',
        role: Role.SENIOR,
        agenceCode: 'AG003',
        poste: 'Senior Agent',
        isActive: true,
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateUser.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const result = await service.update('1', updateDto);

      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(userRepository.updateUser).toHaveBeenCalledWith('1', updateDto);
      expect(result.nomComplet).toBe('Updated User');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const updateDto: CreateUserDto = {
        session: 'session',
        nomComplet: 'User',
        email: 'user@example.com',
        role: Role.AGENT,
        agenceCode: 'AG001',
        poste: 'Agent',
        isActive: true,
      };

      userRepository.findById.mockResolvedValue(null);

      await expect(service.update('999', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('updateStatusBySession', () => {
    it('should update user status by session', async () => {
      userRepository.findBySession.mockResolvedValue(mockUser);
      userRepository.updateStatusBySession.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const result = await service.updateStatusBySession('test-session', false);

      expect(userRepository.findBySession).toHaveBeenCalledWith('test-session');
      expect(userRepository.updateStatusBySession).toHaveBeenCalledWith(
        'test-session',
        false,
      );
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException if session does not exist', async () => {
      userRepository.findBySession.mockResolvedValue(null);

      await expect(
        service.updateStatusBySession('invalid-session', false),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.updateStatusBySession).not.toHaveBeenCalled();
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      userRepository.count.mockResolvedValueOnce(10); // totalUsers
      userRepository.count.mockResolvedValueOnce(8); // activeUsers

      const result = await service.getDashboardStats();

      expect(userRepository.count).toHaveBeenCalledTimes(2);
      expect(userRepository.count).toHaveBeenNthCalledWith(1);
      expect(userRepository.count).toHaveBeenNthCalledWith(2, {
        isActive: true,
      });
      expect(result).toEqual({
        totalUsers: 10,
        activeUsers: 8,
        inactiveUsers: 2,
      });
    });
  });
});
