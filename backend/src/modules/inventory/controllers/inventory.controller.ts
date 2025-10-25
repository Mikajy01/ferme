import { Controller, Get, Post, Body, Query, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { CreateInventoryMovementDto } from '../dto/create-inventory-movement.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock')
  getStockSummary() {
    return this.inventoryService.getStockSummary();
  }

  @Get('movements')
  getMovements(@Query('productId') productId?: number) {
    return this.inventoryService.getMovements(productId);
  }

  @Post('movements')
  createMovement(@Body() dto: CreateInventoryMovementDto) {
    return this.inventoryService.createMovement(dto);
  }
}