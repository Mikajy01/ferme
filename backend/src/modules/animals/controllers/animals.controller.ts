import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { AnimalsService } from '../services/animals.service';
import { CreateAnimalDto } from '../dto/create-animal.dto';
import { CreateAnimalEventDto } from '../dto/create-animal-event.dto';
import { FeedAnimalDto } from '../dto/feed-animal.dto';

@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Post()
  create(@Body() createAnimalDto: CreateAnimalDto) {
    return this.animalsService.create(createAnimalDto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.animalsService.findAll(status);
  }

  @Get('events')
  getEvents(@Query('animalId') animalId?: number) {
    return this.animalsService.getEvents(animalId);
  }

  @Post('events')
  createEvent(@Body() createEventDto: CreateAnimalEventDto) {
    return this.animalsService.createEvent(createEventDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.animalsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAnimalDto: CreateAnimalDto) {
    return this.animalsService.update(id, updateAnimalDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.animalsService.remove(id);
  }

  @Post('feed')
  feed(@Body() feedAnimalDto: FeedAnimalDto) {
    return this.animalsService.feed(feedAnimalDto);
  }
}