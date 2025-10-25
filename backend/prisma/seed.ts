import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Données des utilisateurs par défaut
const DEFAULT_ADMIN = {
  session: 'admin-session',
  name: 'Administrateur',
  firstName: 'Système',
  role: 'admin',
  password: 'admin123',
};


async function main() {
  console.log('🌱 Début du seeding...');
  // Admin
  try {
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
    const admin = await prisma.user.upsert({
      where: { session: DEFAULT_ADMIN.session },
      update: {},
      create: {
        idUser: randomUUID(),
        ...DEFAULT_ADMIN,
        password: hashedPassword,
      },
    });
    console.log('✅ Admin créé avec succès.');
  } catch (e) {
    console.log('⚠️ Erreur lors de la création de l\'admin:', e.message);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    prisma.$disconnect();
    process.exit(1);
  });