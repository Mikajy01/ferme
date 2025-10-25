import { Injectable } from '@nestjs/common';
import { ITransactionalRepository } from '../interfaces/transactional-repository.interface';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class PrismaTransactionalRepository implements ITransactionalRepository {
  constructor(private readonly prismaService: PrismaService) {}

}