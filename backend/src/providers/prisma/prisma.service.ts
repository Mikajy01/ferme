import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly maxRetries = 5;
  private readonly retryInterval = 5000; // 5 secondes
  private readonly retryDelayLong = 30 * 60 * 1000; // 30 minutes
  private reconnectScheduled = false;

  constructor() {
    super({
      log: ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Déconnexion de la base de données');
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Arrêt du client Prisma en raison du signal: ${signal}`);
    await this.$disconnect();
  }

  private async connectWithRetry(): Promise<void> {
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        await this.$connect();
        this.logger.log('✅ CONNEXION A LA BASE DE DONNÉES RÉUSSIE');
        this.reconnectScheduled = false;
        return;
      } catch (error) {
        retries++;
        this.logger.error(
          `❌ ${retries}e tentative échouée : ${error.message}`,
        );

        if (retries >= this.maxRetries) {
          this.logger.error(
            `⛔ Connexion échouée après ${this.maxRetries} tentatives.`,
          );

          if (!this.reconnectScheduled) {
            this.logger.log(`🔁 Nouvelle tentative dans 30 minutes...`);
            this.reconnectScheduled = true;
            setTimeout(() => this.scheduleReconnect(), this.retryDelayLong);
          }
        } else {
          this.logger.log(
            `⏳ Nouvelle tentative dans ${this.retryInterval / 1000} secondes...`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryInterval),
          );
        }
      }
    }
  }

  private async scheduleReconnect() {
    this.logger.log('🔄 Tentative de reconnexion après 30 minutes...');
    await this.connectWithRetry();
  }

}
