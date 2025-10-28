import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidRoleException extends HttpException {
  constructor() {
    super('Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.', HttpStatus.FORBIDDEN);
  }
}