import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { ISaleRepository } from '../interfaces/sale-repository.interface';
import { CreateSaleDto } from '../dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @Inject('ISaleRepository')
    private saleRepository: ISaleRepository,
    @Inject('IUnitOfWork')
    private unitOfWork: IUnitOfWork,
  ) {}

  async findAll() {
    return this.saleRepository.findAll();
  }

  async findOne(id: number) {
    const sale = await this.saleRepository.findById(id);
    if (!sale) {
      throw new NotFoundException(`Vente avec l'ID ${id} non trouvée`);
    }
    return sale;
  }

  async create(createSaleDto: CreateSaleDto) {
    return this.unitOfWork.executeTransaction(async (tx) => {
      const totalAmount = createSaleDto.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );

      const sale = await tx.saleRepository.create(
        {
          customer: createSaleDto.customer,
          date: createSaleDto.date,
          items: createSaleDto.items,
        },
        totalAmount,
      );

      for (const item of sale.items) {
        const batches = await tx.batchRepository.getBatchAvailable(
          item.productId,
        );

        let remainingQty = item.quantity;
        for (const batch of batches) {
          if (remainingQty <= 0) break;

          const qtyToUse = Math.min(batch.remaining, remainingQty);

          await tx.inventoryRepository.createMovement({
            type: 'SALE',
            productId: item.productId,
            batchId: batch.id,
            quantity: qtyToUse,
            date: new Date(createSaleDto.date || Date.now()),
            reference: `sale:${sale.id}`,
          });

          await tx.batchRepository.updateRemaining(
            batch.id,
            batch.remaining - qtyToUse,
          );

          remainingQty -= qtyToUse;
        }

        if (remainingQty > 0) {
          throw new BadRequestException(
            `Stock insuffisant pour le produit ${item.productId}. Manque: ${remainingQty}`,
          );
        }
      }

      await tx.financialRepository.create({
        type: 'INCOME',
        amount: totalAmount,
        date: new Date(createSaleDto.date || Date.now()),
        note: createSaleDto.customer ? `Vente à ${createSaleDto.customer}` : 'Vente',
        saleId: sale.id,
      });

      return sale;
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.unitOfWork.executeTransaction(async (tx) => {
      await tx.inventoryRepository.deleteByReference(`sale:${id}`);
      await tx.financialRepository.deleteBySaleId(id);
      return tx.saleRepository.delete(id);
    });
  }

  async getSalesReport(startDate?: string, endDate?: string) {
    return this.saleRepository.getTotalSalesByPeriod(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}