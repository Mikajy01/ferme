import { Test, TestingModule } from '@nestjs/testing';
import { AgencesService } from 'src/modules/agences/services/agences.service';
import { PrismaService } from 'src/providers/prisma/prisma.service';

describe('AgencesService', () => {
  let service: AgencesService;
  let prisma: PrismaService;

  const agencesMock = [
    { agenceCode: 'AG001', nomAgence: 'Agence A' },
    { agenceCode: 'AG002', nomAgence: 'Agence B' },
  ];

  const prismaMock = {
    agence: {
      findMany: jest.fn().mockResolvedValue(agencesMock),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgencesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<AgencesService>(AgencesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  it('devrait retourner la liste des agences triées', async () => {
    const result = await service.findAll();
    expect(prisma.agence.findMany).toHaveBeenCalledWith({
      orderBy: { nomAgence: 'asc' },
    });
    expect(result).toEqual(agencesMock);
  });
});
