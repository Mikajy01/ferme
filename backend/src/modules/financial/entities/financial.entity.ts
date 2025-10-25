import { Decimal } from '@prisma/client/runtime/library';

export class FinancialEntity {
  id: number;
  type: string;
  amount: Decimal;
  date: Date;
  note?: string | null; // ✅ autorise null aussi
  purchaseId?: number | null;
  saleId?: number | null;
  productionId?: number | null;
}
