import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create account types
  await prisma.accountType.upsert({
    where: {
      name: 'SPOTIFY',
    },
    update: {},
    create: {
      name: 'SPOTIFY',
    },
  })    

  await prisma.accountType.upsert({
    where: {
      name: 'APPLE_MUSIC',
    },
    update: {},
    create: {
      name: 'APPLE_MUSIC',
    },
  })

  console.log('Seeded account types')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
