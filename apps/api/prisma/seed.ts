import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? '',
  }),
});

async function main() {
  const categories = [
    { name: 'Portraits', slug: 'portraits', displayOrder: 1, showInMenu: true },
    { name: 'Landscapes', slug: 'landscapes', displayOrder: 2, showInMenu: true },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, displayOrder: c.displayOrder, showInMenu: c.showInMenu },
      create: c,
    });
  }

  const portraits = await prisma.category.findUnique({ where: { slug: 'portraits' } });
  const landscapes = await prisma.category.findUnique({ where: { slug: 'landscapes' } });

  if (!portraits || !landscapes) throw new Error('Seed categories not found');

  const albums = [
    {
      name: 'Summer Trip',
      slug: 'summer-trip',
      categoryId: landscapes.id,
      displayOrder: 1,
      isHidden: false,
    },
    {
      name: 'City Lights',
      slug: 'city-lights',
      categoryId: landscapes.id,
      displayOrder: 2,
      isHidden: false,
    },
    {
      name: 'Studio Portraits',
      slug: 'studio-portraits',
      categoryId: portraits.id,
      displayOrder: 1,
      isHidden: false,
    },
  ];

  for (const a of albums) {
    await prisma.album.upsert({
      where: { slug: a.slug },
      update: {
        name: a.name,
        categoryId: a.categoryId,
        displayOrder: a.displayOrder,
        isHidden: a.isHidden,
      },
      create: a,
    });
  }

  const summerTrip = await prisma.album.findUnique({ where: { slug: 'summer-trip' } });
  const cityLights = await prisma.album.findUnique({ where: { slug: 'city-lights' } });
  const studioPortraits = await prisma.album.findUnique({ where: { slug: 'studio-portraits' } });

  if (!summerTrip || !cityLights || !studioPortraits) throw new Error('Seed albums not found');

  const photos = [
    {
      albumId: summerTrip.id,
      filename: 'summer-1.jpg',
      originalUrl: 'https://picsum.photos/id/1015/1200/800',
      thumbnailUrl: 'https://picsum.photos/id/1015/400/300',
      description: 'Mountain view',
      displayOrder: 1,
      isSliderImage: true,
      width: 1200,
      height: 800,
    },
    {
      albumId: summerTrip.id,
      filename: 'summer-2.jpg',
      originalUrl: 'https://picsum.photos/id/1016/1200/800',
      thumbnailUrl: 'https://picsum.photos/id/1016/400/300',
      description: 'Lake',
      displayOrder: 2,
      isSliderImage: true,
      width: 1200,
      height: 800,
    },
    {
      albumId: summerTrip.id,
      filename: 'summer-3.jpg',
      originalUrl: 'https://picsum.photos/id/1018/1200/800',
      thumbnailUrl: 'https://picsum.photos/id/1018/400/300',
      description: 'Forest',
      displayOrder: 3,
      isSliderImage: false,
      width: 1200,
      height: 800,
    },

    {
      albumId: cityLights.id,
      filename: 'city-1.jpg',
      originalUrl: 'https://picsum.photos/id/1031/1200/800',
      thumbnailUrl: 'https://picsum.photos/id/1031/400/300',
      description: 'Night street',
      displayOrder: 1,
      isSliderImage: false,
      width: 1200,
      height: 800,
    },
    {
      albumId: cityLights.id,
      filename: 'city-2.jpg',
      originalUrl: 'https://picsum.photos/id/1035/1200/800',
      thumbnailUrl: 'https://picsum.photos/id/1035/400/300',
      description: 'Skyscraper',
      displayOrder: 2,
      isSliderImage: false,
      width: 1200,
      height: 800,
    },

    {
      albumId: studioPortraits.id,
      filename: 'portrait-1.jpg',
      originalUrl: 'https://picsum.photos/id/1027/1200/800',
      thumbnailUrl: 'https://picsum.photos/id/1027/400/300',
      description: 'Studio light',
      displayOrder: 1,
      isSliderImage: false,
      width: 1200,
      height: 800,
    },
    {
      albumId: studioPortraits.id,
      filename: 'portrait-2.jpg',
      originalUrl: 'https://picsum.photos/id/1021/1200/800',
      thumbnailUrl: 'https://picsum.photos/id/1021/400/300',
      description: 'Classic portrait',
      displayOrder: 2,
      isSliderImage: false,
      width: 1200,
      height: 800,
    },
  ];

  for (const p of photos) {
    await prisma.photo.create({ data: p });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (_e) => {
    await prisma.$disconnect();
    process.exit(1);
  });
