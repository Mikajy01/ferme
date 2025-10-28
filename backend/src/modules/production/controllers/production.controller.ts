import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ProductionService } from '../services/production.service';
import { CreateProductionBatchDto } from '../dto/create-production-batch.dto';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  create(@Body() dto: CreateProductionBatchDto) {
    return this.productionService.create(dto);
  }

  @Get()
  findAll() {
    return this.productionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.findOne(id);
  }

  @Get('recipe/:recipeId/max-quantity')
  async getMaxProducibleQuantity(@Param('recipeId', ParseIntPipe) recipeId: number) {
    return this.productionService.getMaxProducibleQuantity(recipeId);
  }
}