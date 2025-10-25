import { Module } from '@nestjs/common';
import { UtilisateursController } from './controllers/users.controller';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { UsersService } from './services/users.service';

@Module({
  controllers: [UtilisateursController],
  providers: [
    UsersService,
    PrismaService,
    PrismaUserRepository,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
  exports: ['IUserRepository'],
})
export class UsersModule {}
