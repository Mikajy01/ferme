import { Test, TestingModule } from '@nestjs/testing';
import * as ExcelJS from 'exceljs';
import { Role } from 'src/common/enums/roles.enum';
import { ExportUtilisateursService } from 'src/modules/utilistaeurs/services/export-utilisateurs.service';

describe('ExportUtilisateursService', () => {
  let service: ExportUtilisateursService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExportUtilisateursService],
    }).compile();

    service = module.get<ExportUtilisateursService>(ExportUtilisateursService);
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  describe('exportUsers', () => {
    it('devrait créer un fichier Excel avec les utilisateurs', async () => {
      // Données de test
      const users = [
        {
          session: 'session1',
          nomComplet: 'Utilisateur Test 1',
          email: 'test1@example.com',
          role: Role.ADMIN,
          agenceCode: null,
          poste: 'Administrateur',
          isActive: true,
        },
        {
          session: 'session2',
          nomComplet: 'Utilisateur Test 2',
          email: 'test2@example.com',
          role: Role.AGENT,
          agenceCode: 'AG001',
          poste: 'Agent guichet',
          isActive: false,
        },
      ];

      // Exécution
      const result = await service.exportUsers(users);

      // Vérifications
      expect(result).toBeInstanceOf(Buffer);

      // Charger le buffer dans ExcelJS pour vérification
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(result as any as ExcelJS.Buffer);

      // Vérifier la feuille
      const worksheet = workbook.getWorksheet('Utilisateurs');
      expect(worksheet).toBeDefined();
      if (!worksheet) throw new Error('Worksheet non trouvée');

      // Vérifier les en-têtes
      const headerRow = worksheet.getRow(1);
      expect(headerRow.getCell(1).value).toBe('Session');
      expect(headerRow.getCell(2).value).toBe('Nom Complet');
      expect(headerRow.getCell(3).value).toBe('Email');
      expect(headerRow.getCell(4).value).toBe('Rôle');
      expect(headerRow.getCell(5).value).toBe('Code Agence');
      expect(headerRow.getCell(6).value).toBe('Poste');
      expect(headerRow.getCell(7).value).toBe('Actif');

      // Vérifier le style des en-têtes (avec vérification de type)
      const headerCellFill = headerRow.getCell(1).fill as ExcelJS.FillPattern;
      expect(headerCellFill.type).toBe('pattern');
      expect(headerCellFill.pattern).toBe('solid');
      expect(headerCellFill.fgColor?.argb).toBe('FF4472C4');
      
      const headerCellFont = headerRow.getCell(1).font;
      expect(headerCellFont?.bold).toBe(true);
      expect(headerCellFont?.color?.argb).toBe('FFFFFFFF');

      // Vérifier les données
      const dataRow1 = worksheet.getRow(2);
      expect(dataRow1.getCell(1).value).toBe('session1');
      expect(dataRow1.getCell(2).value).toBe('Utilisateur Test 1');
      expect(dataRow1.getCell(3).value).toBe('test1@example.com');
      expect(dataRow1.getCell(4).value).toBe(Role.ADMIN);
      expect(dataRow1.getCell(5).value).toBe('N/A');
      expect(dataRow1.getCell(6).value).toBe('Administrateur');
      expect(dataRow1.getCell(7).value).toBe('Oui');

      const dataRow2 = worksheet.getRow(3);
      expect(dataRow2.getCell(7).value).toBe('Non');

      // Vérifier la validation des données pour les rôles
      const dataValidation = worksheet.getCell('D2').dataValidation;
      expect(dataValidation?.type).toBe('list');
      expect(dataValidation?.formulae?.[0]).toContain(Object.values(Role).join(','));
    });

    it('devrait gérer un tableau vide', async () => {
      const result = await service.exportUsers([]);
      expect(result).toBeInstanceOf(Buffer);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(result as any as ExcelJS.Buffer);

      const worksheet = workbook.getWorksheet('Utilisateurs');
      expect(worksheet).toBeDefined();
      if (!worksheet) throw new Error('Worksheet non trouvée');
      
      expect(worksheet.rowCount).toBe(1); // Seulement la ligne d'en-tête
    });

    it('devrait formater correctement les valeurs nulles pour agenceCode', async () => {
      const users = [
        {
          session: 'session3',
          nomComplet: 'Utilisateur Sans Agence',
          email: 'no-agence@example.com',
          role: Role.ADMIN,
          agenceCode: null,
          poste: 'Admin',
          isActive: true,
        },
      ];

      const result = await service.exportUsers(users);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(result as any as ExcelJS.Buffer);

      const worksheet = workbook.getWorksheet('Utilisateurs');
      expect(worksheet).toBeDefined();
      if (!worksheet) throw new Error('Worksheet non trouvée');
      
      expect(worksheet.getRow(2).getCell(5).value).toBe('N/A');
    });
  });
});