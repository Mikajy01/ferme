import { Test, TestingModule } from '@nestjs/testing';
import { AgencesController } from 'src/modules/agences/controllers/agences.controller';
import { AgencesService } from 'src/modules/agences/services/agences.service';

describe('AgencesController', () => {
  let controller: AgencesController;
  let service: AgencesService;

  const agencesMock = [
    { agenceCode: 'AG001', nomAgence: 'Agence A' },
    { agenceCode: 'AG002', nomAgence: 'Agence B' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgencesController],
      providers: [
        {
          provide: AgencesService,
          useValue: { findAll: jest.fn().mockResolvedValue(agencesMock) },
        },
      ],
    }).compile();

    controller = module.get<AgencesController>(AgencesController);
    service = module.get<AgencesService>(AgencesService);
  });

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  it('devrait retourner la liste des agences depuis le service', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(agencesMock);
  });
});
