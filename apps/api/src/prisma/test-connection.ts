import { PrismaClient } from '@prisma/client';

async function testConnection(): Promise<void> {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Attempting to connect to the database...');
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');

    // Try a simple query
    const categories = await prisma.category.findMany();
    console.log(`✅ Successfully queried categories. Found ${categories.length} categories.`);
  } catch (error) {
    console.error('❌ Failed to connect to the database:');
    console.error('Error details:', error);

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().catch((error) => {
  console.error('Unhandled error in test script:', error);
  process.exit(1);
});
