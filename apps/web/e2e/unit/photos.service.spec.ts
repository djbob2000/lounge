import type { Album, Photo } from '@lounge/types';
import { expect, test } from '@playwright/test';

test.describe('PhotosService Unit Tests', () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const _TEST_PHOTO_DESCRIPTION = 'Test Photo Unit';

  let testAlbum: Album | null = null;
  let authToken: string | null = null;

  test.beforeAll(async ({ request }) => {
    // Получаем тестовый токен для админа
    const response = await request.post(`${API_BASE_URL}/auth/test-token`, {
      data: { role: 'admin' },
    });

    if (response.ok()) {
      const data = await response.json();
      authToken = data.token;
    }

    // Создаем тестовый альбом
    if (authToken) {
      const albumResponse = await request.post(`${API_BASE_URL}/v1/albums`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: 'Test Album for Photos',
          slug: 'test-album-photos',
          description: 'Test album for photo unit tests',
          categoryId: 'test-category-id',
          isHidden: false,
        },
      });

      if (albumResponse.ok()) {
        testAlbum = (await albumResponse.json()) as Album;
      }
    }
  });

  test.afterAll(async ({ request }) => {
    // Очистка: удаляем тестовые данные
    if (testAlbum?.id && authToken) {
      await request.delete(`${API_BASE_URL}/v1/albums/${testAlbum.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    }
  });

  test('should get all photos', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/v1/photos`);

    expect(response.ok()).toBeTruthy();

    const photos = (await response.json()) as Photo[];
    expect(Array.isArray(photos)).toBeTruthy();

    // Проверяем структуру фотографий
    photos.forEach((photo) => {
      expect(photo).toHaveProperty('id');
      expect(photo).toHaveProperty('originalUrl');
      expect(photo).toHaveProperty('albumId');
      expect(photo).toHaveProperty('displayOrder');
      expect(photo).toHaveProperty('isSliderImage');
    });
  });

  test('should get slider photos', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/v1/photos/slider`);

    expect(response.ok()).toBeTruthy();

    const photos = (await response.json()) as Photo[];
    expect(Array.isArray(photos)).toBeTruthy();

    // Все фото должны быть слайдерными
    photos.forEach((photo) => {
      expect(photo.isSliderImage).toBe(true);
    });
  });

  test('should get photos by album', async ({ request }) => {
    if (!testAlbum) {
      test.skip();
      return;
    }

    const response = await request.get(`${API_BASE_URL}/v1/photos/album/${testAlbum.id}`);

    expect(response.ok()).toBeTruthy();

    const photos = (await response.json()) as Photo[];
    expect(Array.isArray(photos)).toBeTruthy();

    // Все фото должны принадлежать альбому
    photos.forEach((photo) => {
      expect(photo.albumId).toBe(testAlbum?.id);
    });
  });

  test('should get photo by id', async ({ request }) => {
    // Сначала получаем список фото
    const listResponse = await request.get(`${API_BASE_URL}/v1/photos`);

    if (!listResponse.ok()) {
      test.skip();
      return;
    }

    const photos = (await listResponse.json()) as Photo[];
    if (photos.length === 0) {
      test.skip();
      return;
    }

    const firstPhoto = photos[0];
    if (!firstPhoto) {
      test.skip();
      return;
    }
    const response = await request.get(`${API_BASE_URL}/v1/photos/${firstPhoto.id}`);

    expect(response.ok()).toBeTruthy();

    const photo = (await response.json()) as Photo;
    expect(photo.id).toBe(firstPhoto.id);
    expect(photo.originalUrl).toBe(firstPhoto.originalUrl);
  });

  test('should update photo display order', async ({ request }) => {
    // Сначала получаем список фото
    const listResponse = await request.get(`${API_BASE_URL}/v1/photos`);

    if (!listResponse.ok() || !authToken) {
      test.skip();
      return;
    }

    const photos = (await listResponse.json()) as Photo[];
    if (photos.length === 0) {
      test.skip();
      return;
    }

    const photoToUpdate = photos[0];
    if (!photoToUpdate) {
      test.skip();
      return;
    }
    const newDisplayOrder = photoToUpdate.displayOrder + 1;

    const response = await request.patch(`${API_BASE_URL}/v1/photos/${photoToUpdate.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        displayOrder: newDisplayOrder,
      },
    });

    expect(response.ok()).toBeTruthy();

    const updatedPhoto = (await response.json()) as Photo;
    expect(updatedPhoto.displayOrder).toBe(newDisplayOrder);
  });

  test('should update multiple photos order', async ({ request }) => {
    if (!authToken) {
      test.skip();
      return;
    }

    // Сначала получаем список фото
    const listResponse = await request.get(`${API_BASE_URL}/v1/photos`);

    if (!listResponse.ok()) {
      test.skip();
      return;
    }

    const photos = (await listResponse.json()) as Photo[];
    if (photos.length < 2) {
      test.skip();
      return;
    }

    const photosToReorder = photos.slice(0, 2).map((photo, index) => ({
      id: photo.id,
      displayOrder: index + 100, // Новый порядок
    }));

    const response = await request.patch(`${API_BASE_URL}/v1/photos/order/update`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        photos: photosToReorder,
      },
    });

    expect(response.ok()).toBeTruthy();

    const updatedPhotos = (await response.json()) as Photo[];
    expect(Array.isArray(updatedPhotos)).toBeTruthy();
  });

  test('should toggle slider status', async ({ request }) => {
    // Сначала получаем список фото
    const listResponse = await request.get(`${API_BASE_URL}/v1/photos`);

    if (!listResponse.ok() || !authToken) {
      test.skip();
      return;
    }

    const photos = (await listResponse.json()) as Photo[];
    if (photos.length === 0) {
      test.skip();
      return;
    }

    const photoToToggle = photos[0];
    if (!photoToToggle) {
      test.skip();
      return;
    }
    const newSliderStatus = !photoToToggle.isSliderImage;

    const response = await request.patch(`${API_BASE_URL}/v1/photos/${photoToToggle.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        isSlider: newSliderStatus,
      },
    });

    expect(response.ok()).toBeTruthy();

    const updatedPhoto = (await response.json()) as Photo;
    expect(updatedPhoto.isSliderImage).toBe(newSliderStatus);
  });

  test('should require authentication for updates', async ({ request }) => {
    // Сначала получаем список фото
    const listResponse = await request.get(`${API_BASE_URL}/v1/photos`);

    if (!listResponse.ok()) {
      test.skip();
      return;
    }

    const photos = (await listResponse.json()) as Photo[];
    if (photos.length === 0) {
      test.skip();
      return;
    }

    const photoToUpdate = photos[0];
    if (!photoToUpdate) {
      test.skip();
      return;
    }

    const response = await request.patch(`${API_BASE_URL}/v1/photos/${photoToUpdate.id}`, {
      data: {
        description: 'Unauthorized update',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should handle invalid photo id', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/v1/photos/invalid-id-123`);

    expect(response.status()).toBe(404);

    const error = await response.json();
    expect(error.message).toContain('not found');
  });
});
