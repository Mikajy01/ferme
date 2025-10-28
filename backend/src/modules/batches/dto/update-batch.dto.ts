import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBatchDto } from './create-batch.dto';

// On ne peut pas modifier productId et purchaseItemId une fois créé
export class UpdateBatchDto extends PartialType(
  OmitType(CreateBatchDto, ['productId', 'purchaseItemId'] as const),
) {}