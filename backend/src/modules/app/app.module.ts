import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../providers/prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { MulterModule } from '@nestjs/platform-express';
import { ProductsModule } from '../products/products.module';
import { BatchesModule } from '../batches/batches.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5MB
      },
      fileFilter: (req, file, cb) => {
        // Accepter seulement les images
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Type de fichier non supporté'), false);
        }
      },
    }),
    PrismaModule,
    UsersModule,
    ProductsModule,
    BatchesModule
  ],
})
export class AppModule {}
