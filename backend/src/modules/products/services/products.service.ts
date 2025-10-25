import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductFilterDto } from '../dto/product-filter.dto';
import { IProductRepository } from '../interfaces/product-repository.interface';
import { IUnitRepository } from 'src/modules/units/interfaces/unit-repository.interface';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('IProductRepository')
    private readonly productsRepository: IProductRepository,
    @Inject('IUnitRepository')
    private readonly unitsRepository: IUnitRepository,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const unit = await this.unitsRepository.findOne(createProductDto.unitId);
    if (!unit) {
      throw new NotFoundException(
        `Unité #${createProductDto.unitId} introuvable`,
      );
    }

    if (createProductDto.sku) {
      const existing = await this.productsRepository.findBySku(
        createProductDto.sku,
      );
      if (existing) {
        throw new ConflictException(
          `Un produit avec le SKU "${createProductDto.sku}" existe déjà`,
        );
      }
    }

    return this.productsRepository.create(createProductDto);
  }

  async findAll(filter?: ProductFilterDto) {
    return this.productsRepository.findAll(filter);
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne(id);
    if (!product) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    if (updateProductDto.unitId) {
      const unit = await this.unitsRepository.findOne(updateProductDto.unitId);
      if (!unit) {
        throw new NotFoundException(
          `Unité #${updateProductDto.unitId} introuvable`,
        );
      }
    }

    if (updateProductDto.sku) {
      const existing = await this.productsRepository.findBySku(
        updateProductDto.sku,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Un autre produit utilise déjà le SKU "${updateProductDto.sku}"`,
        );
      }
    }

    return this.productsRepository.update(id, updateProductDto);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.productsRepository.remove(id);
    } catch (error) {
      throw new BadRequestException(
        'Impossible de supprimer ce produit car il est utilisé dans des transactions',
      );
    }
  }

  async getStock(id: number) {
    await this.findOne(id);
    const stock = await this.productsRepository.getCurrentStock(id);
    return { productId: id, currentStock: stock };
  }
}