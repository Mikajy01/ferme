// src/modules/purchase/services/purchases.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { IPurchaseRepository } from '../interfaces/purchase-repository.interface';
import { CreatePurchaseDto } from '../dto/create-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    @Inject('IPurchaseRepository')
    private purchaseRepository: IPurchaseRepository,
    @Inject('IUnitOfWork')
    private unitOfWork: IUnitOfWork,
  ) {}

  async findAll() {
    return this.purchaseRepository.findAll();
  }

  async findOne(id: number) {
    const purchase = await this.purchaseRepository.findById(id);
    if (!purchase) {
      throw new NotFoundException(`Achat avec l'ID ${id} non trouvé`);
    }
    return purchase;
  }

  async create(createPurchaseDto: CreatePurchaseDto) {
    return this.unitOfWork.executeTransaction(async (tx) => {
      const totalAmount = createPurchaseDto.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );

      const purchase = await tx.purchaseRepository.create(
        {
          supplier: createPurchaseDto.supplier,
          date: new Date(createPurchaseDto.date).toDateString(),
          items: createPurchaseDto.items,
        },
        totalAmount
      );

      for (const item of purchase.items) {
        const batch = await tx.batchRepository.create({
          productId: item.productId,
          purchaseItemId: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          receivedAt: new Date(createPurchaseDto.date),
        });

        await tx.batchRepository.updateRemaining(batch.id, item.quantity)

        await tx.inventoryRepository.createMovement({
          type: 'IN',
          productId: item.productId,
          batchId: batch.id,
          quantity: item.quantity,
          date: new Date(createPurchaseDto.date).toDateString(),
          reference: `purchase:${purchase.id}`,
        });
      }

      await tx.financialRepository.create({
        type: 'EXPENSE',
        amount: totalAmount,
        date: new Date(createPurchaseDto.date).toDateString(),
        note: `Achat auprès de ${createPurchaseDto.supplier}`,
        purchaseId: purchase.id,
      });

      return this.findOne(purchase.id);
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return await this.purchaseRepository.delete(id);
  }
}
