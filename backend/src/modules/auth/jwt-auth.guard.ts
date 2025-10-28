// src/modules/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MissingTokenException } from '../../common/exceptions/missing-token.exception';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    // Vérifier si le token est manquant
    if (info && info.message === 'No auth token') {
      throw new MissingTokenException();
    }
    
    // Vérifier si le token est expiré
    if (info && info.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Votre session a expiré. Veuillez vous reconnecter.');
    }
    
    // Vérifier les autres erreurs d'authentification
    if (err || !user) {
      throw new UnauthorizedException('Token invalide. Veuillez vous reconnecter.');
    }
    
    return user;
  }
}