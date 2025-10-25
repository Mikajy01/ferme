import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { IBatchRepository } from '../interfaces/batches-repository.interface';
import { IProductRepository } from 'src/modules/products/interfaces/product-repository.interface';
import { CreateBatchDto } from '../dto/create-batch.dto';
import { BatchFilterDto } from '../dto/batch-filter.dto';
import { UpdateBatchDto } from '../dto/update-batch.dto';

@Injectable()
export class BatchesService {
  constructor(
    @Inject('IBatchRepository')
    private readonly batchesRepository: IBatchRepository,
    @Inject('IProductRepository')
    private readonly productsRepository: IProductRepository,
  ) {}

  async create(createBatchDto: CreateBatchDto) {
    const product = await this.productsRepository.findOne(
      createBatchDto.productId,
    );
    if (!product) {
      throw new NotFoundException(
        `Produit #${createBatchDto.productId} introuvable`,
      );
    }

    if (createBatchDto.quantity <= 0) {
      throw new BadRequestException('La quantité doit être positive');
    }

    if (createBatchDto.unitPrice <= 0) {
      throw new BadRequestException('Le prix unitaire doit être positif');
    }

    return this.batchesRepository.create(createBatchDto);
  }

  async findAll(filter?: BatchFilterDto) {
    return this.batchesRepository.findAll(filter);
  }

  async findOne(id: number) {
    const batch = await this.batchesRepository.findOne(id);
    if (!batch) {
      throw new NotFoundException(`Lot #${id} introuvable`);
    }
    return batch;
  }

  async update(id: number, updateBatchDto: UpdateBatchDto) {
    await this.findOne(id);

    if (updateBatchDto.quantity !== undefined && updateBatchDto.quantity <= 0) {
      throw new BadRequestException('La quantité doit être positive');
    }

    if (
      updateBatchDto.unitPrice !== undefined &&
      updateBatchDto.unitPrice <= 0
    ) {
      throw new BadRequestException('Le prix unitaire doit être positif');
    }

    return this.batchesRepository.update(id, updateBatchDto);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.batchesRepository.remove(id);
    } catch (error) {
      throw new BadRequestException(
        'Impossible de supprimer ce lot car il est référencé dans des mouvements d\'inventaire',
      );
    }
  }

  async getExpiringSoon(days: number = 30) {
    if (days <= 0) {
      throw new BadRequestException(
        'Le nombre de jours doit être positif',
      );
    }
    return this.batchesRepository.getExpiringSoon(days);
  }
}