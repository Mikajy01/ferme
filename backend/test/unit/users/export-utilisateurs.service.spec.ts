import { Test, TestingModule } from '@nestjs/testing';
import { Role } from 'src/common/enums/roles.enum';
import * as ExcelJS from 'exceljs';
import { ExportUtilisateursService } from 'src/modules/utilistaeurs/services/export-utilisateurs.service';

// Mock ExcelJS
jest.mock('exceljs');

describe('ExportUtilisateursService', () => {
  let service: ExportUtilisateursService;
  let mockWorkbook: jest.Mocked<ExcelJS.Workbook>;
  let mockWorksheet: jest.Mocked<ExcelJS.Worksheet>;

  const mockUsers = [
    {
      session: 'session1',
      nomComplet: 'John Doe',
      email: 'john@example.com',
      role: Role.AGENT,
      agenceCode: 'AG001',
      poste: 'Agent Guichet',
      isActive: true
    },
    {
      session: 'session2',
      nomComplet: 'Jane Smith',
      email: 'jane@example.com',
      role: Role.ADMIN,
      agenceCode: null,
      poste: 'Administrateur',
      isActive: false
    }
  ];

  beforeEach(async () => {
    // Mock worksheet methods
    const mockHeaderRow = {
      eachCell: jest.fn((callback) => {
        const mockCell = {
          fill: undefined,
          font: undefined,
          alignment: undefined,
          border: undefined
        };
        callback(mockCell);
      })
    };

    mockWorksheet = {
      addRow: jest.fn().mockReturnValueOnce(mockHeaderRow).mockReturnValue({}),
      columns: [],
      getCell: jest.fn().mockReturnValue({ dataValidation: undefined }),
    } as any;

    // Mock workbook methods
    mockWorkbook = {
      addWorksheet: jest.fn().mockReturnValue(mockWorksheet),
      xlsx: {
        writeBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
      }
    } as any;

    (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);

    const module: TestingModule = await Test.createTestingModule({
      providers: [ExportUtilisateursService],
    }).compile();

    service = module.get<ExportUtilisateursService>(ExportUtilisateursService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exportUsers', () => {
    it('should create Excel workbook with users data', async () => {
      const result = await service.exportUsers(mockUsers);

      expect(ExcelJS.Workbook).toHaveBeenCalled();
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Utilisateurs');
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should add header row with correct columns', async () => {
      await service.exportUsers(mockUsers);

      expect(mockWorksheet.addRow).toHaveBeenCalledWith([
        'Session',
        'Nom Complet',
        'Email',
        'Rôle',
        'Code Agence',
        'Poste',
        'Actif'
      ]);
    });

    it('should add user data rows', async () => {
      await service.exportUsers(mockUsers);

      // Header row + 2 user rows = 3 calls to addRow
      expect(mockWorksheet.addRow).toHaveBeenCalledTimes(3);
      
      // Check first user data
      expect(mockWorksheet.addRow).toHaveBeenNthCalledWith(2, {
        session: 'session1',
        nomComplet: 'John Doe',
        email: 'john@example.com',
        role: Role.AGENT,
        agenceCode: 'AG001',
        poste: 'Agent Guichet',
        isActive: 'Oui'
      });

      // Check second user data (with null agenceCode)
      expect(mockWorksheet.addRow).toHaveBeenNthCalledWith(3, {
        session: 'session2',
        nomComplet: 'Jane Smith',
        email: 'jane@example.com',
        role: Role.ADMIN,
        agenceCode: 'N/A',
        poste: 'Administrateur',
        isActive: 'Non'
      });
    });

    it('should set column widths', async () => {
      await service.exportUsers(mockUsers);

      expect(mockWorksheet.columns).toEqual([
        { key: 'session', width: 20 },
        { key: 'nomComplet', width: 30 },
        { key: 'email', width: 30 },
        { key: 'role', width: 15 },
        { key: 'agenceCode', width: 15 },
        { key: 'poste', width: 20 },
        { key: 'isActive', width: 10 },
      ]);
    });

    it('should add data validation for role column', async () => {
      await service.exportUsers(mockUsers);

      // Should call getCell for each user row (D2, D3)
      expect(mockWorksheet.getCell).toHaveBeenCalledWith('D2');
      expect(mockWorksheet.getCell).toHaveBeenCalledWith('D3');
    });

    it('should handle empty users array', async () => {
      const result = await service.exportUsers([]);

      expect(mockWorksheet.addRow).toHaveBeenCalledTimes(1); // Only header row
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should convert buffer correctly', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      (mockWorkbook.xlsx.writeBuffer as jest.Mock).mockResolvedValue(mockArrayBuffer);

      const result = await service.exportUsers(mockUsers);

      expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });
});