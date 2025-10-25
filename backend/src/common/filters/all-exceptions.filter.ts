// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Log de l'erreur pour le debug
    this.logger.error(
      `Exception caught: ${exception.constructor.name}`,
      exception.stack,
      `${request.method} ${request.url}`,
    );

    // Si c'est déjà une HttpException (comme 404, 403, etc.), on la transmet sans toucher
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.getResponse();
      return response.status(status).json(
        typeof message === 'string' ? { message } : message
      );
    }

    // Erreurs Prisma spécifiques
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaKnownRequestError(exception, response);
    }

    if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Erreur de requête inconnue',
        error: 'Bad Request',
      });
    }

    if (exception instanceof Prisma.PrismaClientRustPanicError) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erreur critique de la base de données',
        error: 'Internal Server Error',
      });
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Impossible de se connecter à la base de données',
        error: 'Service Unavailable',
      });
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Erreur de validation des données',
        error: 'Bad Request',
      });
    }

    // Erreurs génériques (non traitées spécifiquement)
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : exception.message,
    });
  }

  private handlePrismaKnownRequestError(
    exception: Prisma.PrismaClientKnownRequestError,
    response: Response,
  ) {
    switch (exception.code) {
      case 'P2002':
        // Unique constraint failed
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: this.getUniqueConstraintMessage(exception),
          error: 'Conflict',
        });

      case 'P2025':
        // Record not found
        return response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Enregistrement non trouvé',
          error: 'Not Found',
        });

      case 'P2003':
        // Foreign key constraint failed
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Violation de contrainte de clé étrangère',
          error: 'Bad Request',
        });

      case 'P2004':
        // Constraint failed
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Violation de contrainte de base de données',
          error: 'Bad Request',
        });

      case 'P2024':
        // Timed out fetching a new connection from the connection pool
        return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Pool de connexions saturé - impossible d\'obtenir une connexion',
          error: 'Service Unavailable',
        });

      case 'P1001':
        // Database server unreachable
        return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Base de données non disponible',
          error: 'Service Unavailable',
        });

      case 'P1002':
        // Database server timeout
        return response.status(HttpStatus.REQUEST_TIMEOUT).json({
          statusCode: HttpStatus.REQUEST_TIMEOUT,
          message: 'Timeout de la base de données',
          error: 'Request Timeout',
        });

      case 'P1008':
        // Operations timed out
        return response.status(HttpStatus.REQUEST_TIMEOUT).json({
          statusCode: HttpStatus.REQUEST_TIMEOUT,
          message: 'Opération timeout',
          error: 'Request Timeout',
        });

      default:
        // Autres erreurs Prisma
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Erreur de base de données',
          error: 'Bad Request',
        });
    }
  }

  private getUniqueConstraintMessage(exception: Prisma.PrismaClientKnownRequestError): string {
    const target = exception.meta?.target;

    // Cas où target est un tableau de champs (ex: ["email"])
    if (Array.isArray(target)) {
      const fieldMessages: Record<string, string> = {
        ref: 'Cette référence existe déjà',
        email: 'Cette adresse email est déjà utilisée',
        codeClient: 'Ce code client existe déjà',
        code: 'Ce code existe déjà',
        username: 'Ce nom d\'utilisateur est déjà pris',
      };

      for (const field of target) {
        if (fieldMessages[field]) {
          return fieldMessages[field];
        }
      }
      return `Le champ ${target.join(', ')} doit être unique`;
    }

    if (typeof target === 'string') {
      const tableMessages: Record<string, string> = {
        'dbo.Contract': 'Un contrat avec cette référence existe déjà',
        'dbo.User': 'Un utilisateur avec cette session existe déjà',
        // Ajouter d'autres tables au besoin
      };
      return tableMessages[target] || `Violation de contrainte unique sur ${target}`;
    }

    return 'Une contrainte d\'unicité a été violée';
  }
}