import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SaleRepository } from './repositories/sale.repository';
import { InventoryRepository } from '../inventory/repositories/inventory.repository';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class SalesService {
  constructor(
    private saleRepository: SaleRepository,
    private inventoryRepository: InventoryRepository,
    private prisma: PrismaService,
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
    return this.prisma.executeTransaction(async (prisma) => {
      const totalAmount = createSaleDto.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );

      const sale = await prisma.sale.create({
        data: {
          customer: createSaleDto.customer,
          date: createSaleDto.date ? new Date(createSaleDto.date) : new Date(),
          totalAmount,
          items: {
            create: createSaleDto.items.map((item) => ({
              productId: item.productId,
              productionBatchId: item.productionBatchId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of sale.items) {
        const batches = await prisma.batch.findMany({
          where: {
            productId: item.productId,
            remaining: { gt: 0 },
          },
          orderBy: { receivedAt: 'asc' },
        });

        let remainingQty = Number(item.quantity);
        for (const batch of batches) {
          if (remainingQty <= 0) break;

          const qtyToUse = Math.min(Number(batch.remaining), remainingQty);

          await prisma.inventoryMovement.create({
            data: {
              type: 'SALE',
              productId: item.productId,
              batchId: batch.id,
              quantity: qtyToUse,
              date: createSaleDto.date ? new Date(createSaleDto.date) : new Date(),
              reference: `sale:${sale.id}`,
            },
          });

          await prisma.batch.update({
            where: { id: batch.id },
            data: { remaining: Number(batch.remaining) - qtyToUse },
          });

          remainingQty -= qtyToUse;
        }

        if (remainingQty > 0) {
          throw new BadRequestException(
            `Stock insuffisant pour le produit ${item.productId}. Manque: ${remainingQty}`,
          );
        }
      }

      await prisma.financialTransaction.create({
        data: {
          type: 'INCOME',
          amount: totalAmount,
          date: createSaleDto.date ? new Date(createSaleDto.date) : new Date(),
          note: createSaleDto.customer ? `Vente à ${createSaleDto.customer}` : 'Vente',
          saleId: sale.id,
        },
      });

      return this.findOne(sale.id);
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.executeTransaction(async (prisma) => {
      await prisma.inventoryMovement.deleteMany({
        where: { reference: `sale:${id}` },
      });
      await prisma.financialTransaction.deleteMany({
        where: { saleId: id },
      });
      return prisma.sale.delete({ where: { id } });
    });
  }

  async getSalesReport(startDate?: string, endDate?: string) {
    return this.saleRepository.getTotalSalesByPeriod(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
