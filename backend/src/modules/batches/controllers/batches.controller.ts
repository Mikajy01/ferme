import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BatchesService } from '../services/batches.service';
import { CreateBatchDto } from '../dto/create-batch.dto';
import { BatchFilterDto } from '../dto/batch-filter.dto';
import { UpdateBatchDto } from '../dto/update-batch.dto';

@ApiTags('Batches')
@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau lot' })
  @ApiResponse({
    status: 201,
    description: 'Lot créé avec succès',
  })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() createBatchDto: CreateBatchDto) {
    return this.batchesService.create(createBatchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les lots avec filtres' })
  @ApiResponse({
    status: 200,
    description: 'Liste des lots',
  })
  findAll(@Query() filter: BatchFilterDto) {
    return this.batchesService.findAll(filter);
  }

  @Get('expiring')
  @ApiOperation({
    summary: 'Récupérer les lots qui expirent bientôt',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Nombre de jours (défaut: 30)',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des lots expirant bientôt',
  })
  getExpiringSoon(@Query('days', ParseIntPipe) days: number = 30) {
    return this.batchesService.getExpiringSoon(days);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un lot par ID' })
  @ApiParam({ name: 'id', description: 'ID du lot' })
  @ApiResponse({
    status: 200,
    description: 'Lot trouvé',
  })
  @ApiResponse({ status: 404, description: 'Lot introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.batchesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un lot' })
  @ApiParam({ name: 'id', description: 'ID du lot' })
  @ApiResponse({
    status: 200,
    description: 'Lot mis à jour',
  })
  @ApiResponse({ status: 404, description: 'Lot introuvable' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBatchDto: UpdateBatchDto,
  ) {
    return this.batchesService.update(id, updateBatchDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un lot' })
  @ApiParam({ name: 'id', description: 'ID du lot' })
  @ApiResponse({ status: 204, description: 'Lot supprimé' })
  @ApiResponse({ status: 404, description: 'Lot introuvable' })
  @ApiResponse({
    status: 400,
    description: 'Lot utilisé dans des mouvements',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.batchesService.remove(id);
  }
}