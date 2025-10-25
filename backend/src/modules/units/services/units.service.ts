import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { IUnitRepository } from '../interfaces/unit-repository.interface';
import { CreateUnitDto } from '../dto/create-unit.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @Inject('IUnitRepository')
    private readonly unitsRepository: IUnitRepository
) {}

  async create(createUnitDto: CreateUnitDto) {
    const existing = await this.unitsRepository.findByCode(
      createUnitDto.code,
    );
    if (existing) {
      throw new ConflictException(
        `Une unité avec le code "${createUnitDto.code}" existe déjà`,
      );
    }

    return this.unitsRepository.create(createUnitDto);
  }

  async findAll() {
    return this.unitsRepository.findAll();
  }

  async findOne(id: number) {
    const unit = await this.unitsRepository.findOne(id);
    if (!unit) {
      throw new NotFoundException(`Unité #${id} introuvable`);
    }
    return unit;
  }

  async update(id: number, updateUnitDto: UpdateUnitDto) {
    await this.findOne(id);

    if (updateUnitDto.code) {
      const existing = await this.unitsRepository.findByCode(
        updateUnitDto.code,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Une autre unité utilise déjà le code "${updateUnitDto.code}"`,
        );
      }
    }

    return this.unitsRepository.update(id, updateUnitDto);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.unitsRepository.remove(id);
    } catch (error) {
      throw new BadRequestException(
        'Impossible de supprimer cette unité car elle est utilisée par des produits ou recettes',
      );
    }
  }
}