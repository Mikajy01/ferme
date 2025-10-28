import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CreateProductionBatchDto } from '../dto/create-production-batch.dto';
import { IProductionBatchRepository } from '../interfaces/production-batch-repository.interface';
import { IRecipeRepository } from 'src/modules/recipes/interfaces/recipe-repository.interface';
import { IInventoryRepository } from 'src/modules/inventory/interfaces/inventory-repository.interface';
import { IProductRepository } from 'src/modules/products/interfaces/product-repository.interface';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';

@Injectable()
export class ProductionService {
  constructor(
    @Inject('IProductionBatchRepository')
    private productionRepository: IProductionBatchRepository,
    @Inject('IRecipeRepository')
    private recipeRepository: IRecipeRepository,
    @Inject('IProductRepository')
    private productRepository: IProductRepository,
    @Inject('IUnitOfWork')
    private unitOfWork: IUnitOfWork,
  ) {}

  async findAll() {
    return this.productionRepository.findAll();
  }

  async findOne(id: number) {
    const production = await this.productionRepository.findById(id);
    if (!production) {
      throw new NotFoundException(`Production avec l'ID ${id} non trouvée`);
    }
    return production;
  }

  async create(dto: CreateProductionBatchDto) {
    // Récupérer la recette avec ses ingrédients ET le produit de sortie
    const recipe = await this.recipeRepository.findById(dto.recipeId);
    if (!recipe) {
      throw new NotFoundException(`Recette ${dto.recipeId} non trouvée`);
    }

    // Vérifier que la quantité demandée correspond bien au produit de sortie de la recette
    if (dto.outputProductId !== recipe.outputProductId) {
      throw new BadRequestException(
        `Le produit demandé (${dto.outputProductId}) ne correspond pas au produit de sortie de la recette (${recipe.outputProductId})`
      );
    }

    const outputQuantity = dto.outputQuantity;
    
    // Calculer le ratio pour savoir combien de fois on exécute la recette
    // Ex: recette produit 10kg, on veut 35kg → ratio = 3.5
    const ratio = outputQuantity / Number(recipe.outputQuantity);

    return this.unitOfWork.executeTransaction(async (tx) => {
      let totalCost = 0;

      // Créer l'enregistrement de production
      const production = await tx.productionBatchRepository.create({
          recipeId: dto.recipeId,
          outputProductId: recipe.outputProductId, // Pris depuis la recette
          outputQuantity: outputQuantity,
          date: dto.date
      });

      // Consommer les ingrédients
      for (const ingredient of recipe.ingredients) {
        // Quantité requise = quantité par unité de recette × ratio
        const requiredQty = Number(ingredient.quantity) * ratio;
        
        // Récupérer les lots disponibles (FIFO)
        const batches = await tx.batchRepository.getBatchAvailable(+ingredient.productId);
        let remainingQty = requiredQty;
        
        // Consommer les lots un par un
        for (const batch of batches) {
          if (remainingQty <= 0) break;
          
          const qtyToUse = Math.min(Number(batch.remaining), remainingQty);
          
          // Créer le mouvement de sortie
          await tx.inventoryRepository.createMovement({
              type: 'OUT',
              productId: +ingredient.productId,
              batchId: batch.id,
              productionBatchId: production.id,
              quantity: qtyToUse,
              date: dto.date ? new Date(dto.date) : new Date(),
              reference: `production:${production.id}`,
              note: `Production ${recipe.name}`,
          });

          // Mettre à jour le lot
          await tx.batchRepository.updateRemaining(batch.id, Number(batch.remaining) - qtyToUse);

          // Calculer le coût
          totalCost += qtyToUse * Number(batch.unitPrice);
          remainingQty -= qtyToUse;
        }

        // Vérifier qu'on a assez de stock
        if (remainingQty > 0) {
          throw new BadRequestException(
            `Stock insuffisant pour ${ingredient.product?.name}. Manque: ${remainingQty}`,
          );
        }
      }

      // Créer le lot de produit fini
      const outputBatch = await tx.batchRepository.create({
          productId: recipe.outputProductId,
          quantity: outputQuantity,
          remaining: outputQuantity,
          unitPrice: outputQuantity > 0 ? totalCost / outputQuantity : 0,
          receivedAt: dto.date ? new Date(dto.date) : new Date(),
      });

      // Créer le mouvement d'entrée pour le produit fini
      await tx.inventoryRepository.createMovement({
          type: 'IN',
          productId: recipe.outputProductId,
          batchId: outputBatch.id,
          productionBatchId: production.id,
          quantity: outputQuantity,
          date: dto.date ? new Date(dto.date) : new Date(),
          reference: `production:${production.id}`,
      });

      // Mettre à jour le coût total
      const updatedProduction = await tx.productionBatchRepository.updateCostTotal(production.id, totalCost);

      return updatedProduction;
    });
  }

  async getMaxProducibleQuantity(recipeId: number) {
  // Récupérer la recette avec ses ingrédients
  const recipe = await this.recipeRepository.findById(recipeId);
  if (!recipe) {
    throw new NotFoundException(`Recette ${recipeId} non trouvée`);
  }

  // Si la recette n'a pas d'ingrédients, on ne peut rien produire
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      outputProductId: recipe.outputProductId,
      outputQuantity: recipe.outputQuantity,
      maxProducible: 0,
      limitingIngredient: null,
      ingredientsStatus: [],
    };
  }

  let minRatio = Infinity; // Le ratio le plus petit détermine la quantité max
  let limitingIngredient: { productId: string | number; productName: string; available: number; required: number } | null = null;
  const ingredientsStatus: Array<{
    productId: string | number;
    productName: string;
    requiredPerBatch: number;
    available: number;
    maxBatches: number;
  }> = [];

  // Pour chaque ingrédient, calculer combien de fois on peut exécuter la recette
  for (const ingredient of recipe.ingredients) {
    // Utiliser la méthode du repository pour obtenir le stock disponible
    const availableQty = await this.productRepository.getCurrentStock(+ingredient.productId);
    const requiredQtyPerBatch = Number(ingredient.quantity);

    // Combien de fois peut-on exécuter la recette avec cet ingrédient ?
    // Ex: 100kg disponible, recette demande 5kg → ratio = 20
    const ratio = requiredQtyPerBatch > 0 
      ? availableQty / requiredQtyPerBatch 
      : Infinity;

    ingredientsStatus.push({
      productId: ingredient.productId,
      productName: ingredient.product?.name || 'Produit inconnu',
      requiredPerBatch: requiredQtyPerBatch,
      available: availableQty,
      maxBatches: Math.floor(ratio), // Nombre entier de fois qu'on peut produire
    });

    // L'ingrédient qui permet le moins de production est le limitant
    if (ratio < minRatio) {
      minRatio = ratio;
      limitingIngredient = {
        productId: ingredient.productId,
        productName: ingredient.product?.name || 'Produit inconnu',
        available: availableQty,
        required: requiredQtyPerBatch,
      };
    }
  }

  // Quantité maximale = ratio minimal × quantité produite par la recette
  // Ex: ratio min = 3.5, recette produit 10kg → max = 35kg
  const maxProducible = minRatio !== Infinity 
    ? minRatio * Number(recipe.outputQuantity)
    : 0;

  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    outputProductId: recipe.outputProductId,
    outputProductName: recipe.outputProduct?.name || 'Produit inconnu',
    outputQuantityPerBatch: Number(recipe.outputQuantity),
    maxProducible: Math.floor(maxProducible * 10000) / 10000, // Arrondi à 4 décimales
    maxCompleteBatches: Math.floor(minRatio), // Nombre entier de fois qu'on peut produire
    limitingIngredient,
    ingredientsStatus,
  };
}
}