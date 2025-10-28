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
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductFilterDto } from '../dto/product-filter.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau produit' })
  @ApiResponse({
    status: 201,
    description: 'Produit créé avec succès'
  })
  @ApiResponse({ status: 404, description: 'Unité introuvable' })
  @ApiResponse({ status: 409, description: 'SKU déjà existant' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les produits avec filtres' })
  @ApiResponse({
    status: 200,
    description: 'Liste des produits'
  })
  findAll(@Query() filter: ProductFilterDto) {
    return this.productsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un produit par ID' })
  @ApiParam({ name: 'id', description: 'ID du produit' })
  @ApiResponse({
    status: 200,
    description: 'Produit trouvé',
  })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'Récupérer le stock actuel d\'un produit' })
  @ApiParam({ name: 'id', description: 'ID du produit' })
  @ApiResponse({
    status: 200,
    description: 'Stock actuel',
    schema: {
      example: { productId: 1, currentStock: 150.5 },
    },
  })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  getStock(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getStock(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un produit' })
  @ApiParam({ name: 'id', description: 'ID du produit' })
  @ApiResponse({
    status: 200,
    description: 'Produit mis à jour',
  })
  @ApiResponse({ status: 404, description: 'Produit ou unité introuvable' })
  @ApiResponse({ status: 409, description: 'SKU déjà utilisé' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un produit' })
  @ApiParam({ name: 'id', description: 'ID du produit' })
  @ApiResponse({ status: 204, description: 'Produit supprimé' })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  @ApiResponse({
    status: 400,
    description: 'Produit utilisé dans des transactions',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}