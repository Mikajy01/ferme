// src/modules/inventory/services/inventory.service.ts
import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { IInventoryRepository } from '../interfaces/inventory-repository.interface';
import { CreateInventoryMovementDto } from '../dto/create-inventory-movement.dto';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';

@Injectable()
export class InventoryService {
  constructor(
    @Inject('IInventoryRepository')
    private inventoryRepository: IInventoryRepository,
    @Inject('IUnitOfWork')
    private unitOfWork: IUnitOfWork,
  ) {}

  async getStockSummary() {
    return this.inventoryRepository.getStockByProduct();
  }

  async getMovements(productId?: number) {
    return this.inventoryRepository.findAllMovements(productId);
  }

  async createMovement(dto: CreateInventoryMovementDto) {
    return this.unitOfWork.executeTransaction(async (tx) => {
      // Validation pour les sorties de stock
      if (dto.type === 'OUT' && dto.batchId) {
        const batch = await tx.batchRepository.findOne(dto.batchId);
        
        if (!batch) {
          throw new NotFoundException(`Lot ${dto.batchId} non trouvé`);
        }
        
        if (Number(batch.remaining) < dto.quantity) {
          throw new BadRequestException(
            `Stock insuffisant. Disponible: ${batch.remaining}, Demandé: ${dto.quantity}`,
          );
        }
        
        // Mettre à jour le stock restant
        await tx.batchRepository.updateRemaining(
          dto.batchId,
          Number(batch.remaining) - dto.quantity,
        );
      }

      // Créer le mouvement d'inventaire
      return tx.inventoryRepository.createMovement({
        type: dto.type,
        productId: dto.productId,
        batchId: dto.batchId,
        quantity: dto.quantity,
        date: dto.date ? new Date(dto.date) : new Date(),
        reference: dto.reference,
        note: dto.note,
      });
    });
  }
}