import { HttpException, HttpStatus } from '@nestjs/common';

export class MissingTokenException extends HttpException {
  constructor() {
    super('Token manquant. Veuillez vous authentifier.', HttpStatus.UNAUTHORIZED);
  }
}