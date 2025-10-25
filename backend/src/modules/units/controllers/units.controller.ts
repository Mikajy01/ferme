import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UnitsService } from '../services/units.service';
import { CreateUnitDto } from '../dto/create-unit.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';

@ApiTags('Units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle unité' })
  @ApiResponse({
    status: 201,
    description: 'Unité créée avec succès',
  })
  @ApiResponse({ status: 409, description: 'Code déjà existant' })
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitsService.create(createUnitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les unités' })
  @ApiResponse({
    status: 200,
    description: 'Liste des unités',
  })
  findAll() {
    return this.unitsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une unité par ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'unité' })
  @ApiResponse({
    status: 200,
    description: 'Unité trouvée',
  })
  @ApiResponse({ status: 404, description: 'Unité introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unitsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une unité' })
  @ApiParam({ name: 'id', description: 'ID de l\'unité' })
  @ApiResponse({
    status: 200,
    description: 'Unité mise à jour',
  })
  @ApiResponse({ status: 404, description: 'Unité introuvable' })
  @ApiResponse({ status: 409, description: 'Code déjà utilisé' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une unité' })
  @ApiParam({ name: 'id', description: 'ID de l\'unité' })
  @ApiResponse({ status: 204, description: 'Unité supprimée' })
  @ApiResponse({ status: 404, description: 'Unité introuvable' })
  @ApiResponse({
    status: 400,
    description: 'Unité utilisée par des produits',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unitsService.remove(id);
  }
}