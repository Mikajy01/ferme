import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FinancialType } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { FinancialService } from '../services/financial.service';
import { CreateFinancialTransactionDto } from '../dto/create-financial.dto';

@ApiTags('Financial')
@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get()
  @ApiOperation({
    summary:
      'Lister les transactions financières (optionnellement par période)',
  })
  @ApiOkResponse({ description: 'Liste des transactions' })
  @ApiParam({ name: 'startDate', required: false, description: 'Date de début' })
  @ApiParam({ name: 'endDate', required: false, description: 'Date de fin' })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialService.findAll(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('balance')
  @ApiOperation({ summary: 'Récupérer le solde (optionnellement par période)' })
  @ApiOkResponse({ description: 'Solde calculé' })
  @ApiParam({ name: 'startDate', required: false, description: 'Date de début' })
  @ApiParam({ name: 'endDate', required: false, description: 'Date de fin' })
  getBalance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialService.getBalance(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Filtrer les transactions par type' })
  @ApiOkResponse({ description: 'Transactions filtrées par type' })
  @ApiParam({ name: 'startDate', required: false, description: 'Date de début' })
  @ApiParam({ name: 'endDate', required: false, description: 'Date de fin' })
  getByType(
    @Param('type') type: FinancialType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialService.getByType(
      type,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une transaction par id' })
  @ApiOkResponse({ description: 'Détails de la transaction' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.financialService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une transaction financière' })
  @ApiCreatedResponse({ description: 'Transaction créée' })
  create(@Body() createDto: CreateFinancialTransactionDto) {
    return this.financialService.create(createDto);
  }

  @Get('monthly/:year')
  @ApiOperation({ summary: 'Récupérer le résumé mensuel des incomes et expenses pour une année' })
  @ApiOkResponse({ description: 'Résumé mensuel des transactions' })
  @ApiParam({ name: 'year', required: true, description: 'Année (ex: 2023)' })
  getMonthlySummary(@Param('year', ParseIntPipe) year: number) {
    return this.financialService.getMonthlySummary(year);
  }
}