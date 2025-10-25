import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  
  // Configuration CORS dynamique
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [];
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // if (!origin || corsOrigins.includes(origin)) {
    if (true) {
      callback(null, true); // autorisé
    } else {
      console.log(`❌ Origin non autorisé: ${origin}`);
      callback(new Error('Origin non autorisé'));
    }
  },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
    credentials: true,
  };
  app.enableCors(corsOptions);

  // Pipes globaux
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  // Filtre d'exceptions global
  app.useGlobalFilters(new AllExceptionsFilter());

  // 🌍 Swagger activé uniquement en développement
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Plateforme farm management')
      .setDescription('API de gestion agricole et élevage')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  console.log(`
  🚀 Application is running on: 
  - Local: http://localhost:${port}
  - Network: http://${host}:${port}
  - CORS Allowed Origins: ${corsOrigins.join('\n               ')}
  `);
}

bootstrap();