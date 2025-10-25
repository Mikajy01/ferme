import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';
import { UtilisateursController } from 'src/modules/utilistaeurs/controllers/users.controller';
import { UtilisateursService } from 'src/modules/utilistaeurs/services/users.service';
import { ExportUtilisateursService } from 'src/modules/utilistaeurs/services/export-utilisateurs.service';
import { Role } from 'src/common/enums/roles.enum';
import { FindUsersQueryDto } from 'src/modules/utilistaeurs/dtos/find-users-query.dto';
import { CreateUserDto } from 'src/modules/utilistaeurs/dtos/create-user.dto';
import { UpdateUserStatusDto } from 'src/modules/utilistaeurs/dtos/update-user-status.dto';
import { ExportUsersQueryDto } from 'src/modules/utilistaeurs/dtos/export-users-query.dto';

describe('UtilisateursController', () => {
  let controller: UtilisateursController;
  let usersService: jest.Mocked<UtilisateursService>;
  let exportService: jest.Mocked<ExportUtilisateursService>;

  const mockUser = {
    userId: '1',
    role: Role.ADMIN,
    email: 'user@gmail.com',
    agenceCode: 'AG001',
  };
  const mockUserData = {
    idUtilisateur: '1',
    session: 'test-session',
    nomComplet: 'Test User',
    email: 'test@example.com',
    role: Role.AGENT,
    agenceCode: 'AG001',
    poste: 'Agent',
    isActive: true,
    authType: 'local',
    createdAt: new Date(),
    updatedAt: new Date(),
    password: null,
  };

  beforeEach(async () => {
    const mockUsersService = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatusBySession: jest.fn(),
      getDashboardStats: jest.fn(),
    };

    const mockExportService = {
      exportUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UtilisateursController],
      providers: [
        { provide: UtilisateursService, useValue: mockUsersService },
        { provide: ExportUtilisateursService, useValue: mockExportService },
      ],
    }).compile();

    controller = module.get<UtilisateursController>(UtilisateursController);
    usersService = module.get(UtilisateursService);
    exportService = module.get(ExportUtilisateursService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const query: FindUsersQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [mockUserData],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      usersService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(query, mockUser);

      expect(usersService.findAll).toHaveBeenCalledWith(query, mockUser);
      expect(result).toEqual(expected);
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

      usersService.create.mockResolvedValue(mockUserData);

      const result = await controller.create(createDto);

      expect(usersService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockUserData);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto: CreateUserDto = {
        session: 'updated-session',
        nomComplet: 'Updated User',
        email: 'updated@example.com',
        role: Role.AGENT,
        agenceCode: 'AG003',
        poste: 'Senior Agent',
        isActive: true,
      };

      usersService.update.mockResolvedValue({ ...mockUserData, ...updateDto });

      const result = await controller.update('1', updateDto);

      expect(usersService.update).toHaveBeenCalledWith('1', updateDto);
      expect(result.nomComplet).toBe('Updated User');
    });
  });

  describe('updateStatus', () => {
    it('should update user status by session', async () => {
      const statusDto: UpdateUserStatusDto = { isActive: false };
      const updatedUser = { ...mockUserData, isActive: false };

      usersService.updateStatusBySession.mockResolvedValue(updatedUser);

      const result = await controller.updateStatus('test-session', statusDto);

      expect(usersService.updateStatusBySession).toHaveBeenCalledWith(
        'test-session',
        false,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('exportUsers', () => {
    it('should export users to Excel', async () => {
      const query: ExportUsersQueryDto = { role: [Role.AGENT] };
      const mockBuffer = Buffer.from('excel-data');
      const usersData = {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        data: [mockUserData],
      };

      usersService.findAll.mockResolvedValue(usersData);
      exportService.exportUsers.mockResolvedValue(mockBuffer);

      const result = await controller.exportUsers(query);

      expect(usersService.findAll).toHaveBeenCalledWith(query, null);
      expect(exportService.exportUsers).toHaveBeenCalledWith([mockUserData]);
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = { totalUsers: 10, activeUsers: 8, inactiveUsers: 2 };

      usersService.getDashboardStats.mockResolvedValue(mockStats);

      const result = await controller.getDashboardStats();

      expect(usersService.getDashboardStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
});
