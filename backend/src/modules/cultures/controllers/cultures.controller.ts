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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CulturesService } from '../services/cultures.service';
import { CreateCultureDto } from '../dto/create-culture.dto';
import { CreateHarvestDto } from '../dto/create-harvest.dto';
import { CreateCultureEventDto } from '../dto/create-culture-event.dto';

@ApiTags('Cultures')
@Controller('cultures')
export class CulturesController {
  constructor(private readonly culturesService: CulturesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une culture' })
  @ApiCreatedResponse({ description: 'Culture créée' })
  create(@Body() createCultureDto: CreateCultureDto) {
    return this.culturesService.create(createCultureDto);
  }

  @Post('harvest')
  @ApiOperation({ summary: 'Enregistrer une récolte' })
  @ApiCreatedResponse({ description: 'Récolte enregistrée' })
  harvest(@Body() createHarvestDto: CreateHarvestDto) {
    return this.culturesService.harvest(createHarvestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les cultures' })
  @ApiOkResponse({ description: 'Liste des cultures' })
  @ApiParam({ name: 'status', required: false, description: 'Statut de la culture' })
  findAll(@Query('status') status?: string) {
    return this.culturesService.findAll(status);
  }

  @Get('events')
  @ApiOperation({ summary: 'Récupérer les événements de culture' })
  @ApiOkResponse({ description: 'Liste des événements' })
  getEvents(@Query('cultureId') cultureId?: number) {
    return this.culturesService.getEvents(cultureId);
  }

  @Post('events')
  @ApiOperation({ summary: 'Créer un événement pour une culture' })
  @ApiCreatedResponse({ description: 'Événement créé' })
  createEvent(@Body() createEventDto: CreateCultureEventDto) {
    return this.culturesService.createEvent(createEventDto);
  }

  @Get('harvests')
  @ApiOperation({ summary: 'Récupérer les récoltes' })
  @ApiOkResponse({ description: 'Liste des récoltes' })
  getHarvests(@Query('cultureId') cultureId?: number) {
    return this.culturesService.getHarvests(cultureId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une culture par id' })
  @ApiOkResponse({ description: 'Culture trouvée' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.culturesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une culture' })
  @ApiOkResponse({ description: 'Culture mise à jour' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCultureDto: CreateCultureDto,
  ) {
    return this.culturesService.update(id, updateCultureDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une culture' })
  @ApiOkResponse({ description: 'Culture supprimée' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.culturesService.remove(id);
  }
}