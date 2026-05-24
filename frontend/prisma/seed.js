const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const barber = await prisma.user.upsert({
    where: { email: 'barbeiro@barberpro.com' },
    update: {},
    create: {
      name: 'João Barbeiro',
      email: 'barbeiro@barberpro.com',
      passwordHash: '123456',
      role: 'BARBER'
    },
  });

  const service = await prisma.service.create({
    data: {
      name: 'Corte Degradê',
      description: 'Corte na régua.',
      durationMinutes: 45,
      price: 45.0
    }
  });

  console.log('Seed completo!', { barber, service });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
