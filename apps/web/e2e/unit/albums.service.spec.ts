import type { Album, Category } from '@lounge/types';
import { expect, test } from '@playwright/test';

test.describe('AlbumsService Unit Tests', () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const TEST_ALBUM_NAME = 'Test Album Unit';
  const TEST_ALBUM_SLUG = 'test-album-unit';

  let testCategory: Category | null = null;
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

    // Создаем тестовую категорию
    if (authToken) {
      const categoryResponse = await request.post(`${API_BASE_URL}/v1/categories`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: 'Test Category for Albums',
          slug: 'test-category-albums',
          showInMenu: true,
        },
      });

      if (categoryResponse.ok()) {
        testCategory = (await categoryResponse.json()) as Category;
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

    if (testCategory?.id && authToken) {
      await request.delete(`${API_BASE_URL}/v1/categories/${testCategory.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    }
  });

  test('should create album successfully', async ({ request }) => {
    if (!authToken || !testCategory) {
      test.skip();
      return;
    }

    const response = await request.post(`${API_BASE_URL}/v1/albums`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: TEST_ALBUM_NAME,
        slug: TEST_ALBUM_SLUG,
        description: 'Test album description',
        categoryId: testCategory.id,
        isHidden: false,
      },
    });

    expect(response.ok()).toBeTruthy();

    const album = (await response.json()) as Album;
    testAlbum = album;

    expect(album).toBeDefined();
    expect(album.name).toBe(TEST_ALBUM_NAME);
    expect(album.slug).toBe(TEST_ALBUM_SLUG);
    expect(album.description).toBe('Test album description');
    expect(album.categoryId).toBe(testCategory.id);
    expect(album.isHidden).toBe(false);
    expect(album.displayOrder).toBeDefined();
  });

  test('should get all albums', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/v1/albums`);

    expect(response.ok()).toBeTruthy();

    const albums = (await response.json()) as Album[];
    expect(Array.isArray(albums)).toBeTruthy();
    expect(albums.length).toBeGreaterThan(0);

    // Проверяем структуру альбомов
    albums.forEach((album) => {
      expect(album).toHaveProperty('id');
      expect(album).toHaveProperty('name');
      expect(album).toHaveProperty('slug');
      expect(album).toHaveProperty('categoryId');
      expect(album).toHaveProperty('isHidden');
      expect(album).toHaveProperty('displayOrder');
    });
  });

  test('should get albums by category', async ({ request }) => {
    if (!testCategory) {
      test.skip();
      return;
    }

    const response = await request.get(`${API_BASE_URL}/v1/albums/category/${testCategory.id}`);

    expect(response.ok()).toBeTruthy();

    const albums = (await response.json()) as Album[];
    expect(Array.isArray(albums)).toBeTruthy();

    // Все альбомы должны принадлежать категории
    albums.forEach((album) => {
      expect(album.categoryId).toBe(testCategory?.id);
    });
  });

  test('should get album by id', async ({ request }) => {
    if (!testAlbum) {
      test.skip();
      return;
    }

    const response = await request.get(`${API_BASE_URL}/v1/albums/${testAlbum.id}`);

    expect(response.ok()).toBeTruthy();

    const album = (await response.json()) as Album;
    expect(album.id).toBe(testAlbum.id);
    expect(album.name).toBe(testAlbum.name);
    expect(album.slug).toBe(testAlbum.slug);
  });

  test('should get album by slug', async ({ request }) => {
    if (!testAlbum) {
      test.skip();
      return;
    }

    const response = await request.get(`${API_BASE_URL}/v1/albums/slug/${testAlbum.slug}`);

    expect(response.ok()).toBeTruthy();

    const album = (await response.json()) as Album;
    expect(album.slug).toBe(testAlbum.slug);
    expect(album.name).toBe(testAlbum.name);
  });

  test('should update album', async ({ request }) => {
    if (!authToken || !testAlbum) {
      test.skip();
      return;
    }

    const updatedName = 'Updated Test Album';
    const response = await request.patch(`${API_BASE_URL}/v1/albums/${testAlbum.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: updatedName,
        description: 'Updated description',
      },
    });

    expect(response.ok()).toBeTruthy();

    const updatedAlbum = (await response.json()) as Album;
    expect(updatedAlbum.name).toBe(updatedName);
    expect(updatedAlbum.description).toBe('Updated description');
    expect(updatedAlbum.id).toBe(testAlbum.id);

    // Обновляем тестовый альбом
    testAlbum = updatedAlbum;
  });

  test('should toggle album visibility', async ({ request }) => {
    if (!authToken || !testAlbum) {
      test.skip();
      return;
    }

    const newHiddenStatus = !testAlbum.isHidden;

    const response = await request.patch(`${API_BASE_URL}/v1/albums/${testAlbum.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        isHidden: newHiddenStatus,
      },
    });

    expect(response.ok()).toBeTruthy();

    const updatedAlbum = (await response.json()) as Album;
    expect(updatedAlbum.isHidden).toBe(newHiddenStatus);
  });

  test('should set cover image', async ({ request }) => {
    if (!authToken || !testAlbum) {
      test.skip();
      return;
    }

    const coverImageUrl = 'https://example.com/cover-image.jpg';

    const response = await request.patch(`${API_BASE_URL}/v1/albums/${testAlbum.id}/cover`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        coverImageUrl,
      },
    });

    expect(response.ok()).toBeTruthy();

    const updatedAlbum = (await response.json()) as Album;
    expect(updatedAlbum.coverImageUrl).toBe(coverImageUrl);
  });

  test('should update albums order', async ({ request }) => {
    if (!authToken) {
      test.skip();
      return;
    }

    // Сначала получаем список альбомов
    const listResponse = await request.get(`${API_BASE_URL}/v1/albums`);

    if (!listResponse.ok()) {
      test.skip();
      return;
    }

    const albums = (await listResponse.json()) as Album[];
    if (albums.length < 2) {
      test.skip();
      return;
    }

    const albumsToReorder = albums.slice(0, 2).map((album, index) => ({
      id: album.id,
      displayOrder: index + 100, // Новый порядок
    }));

    const response = await request.patch(`${API_BASE_URL}/v1/albums/order/update`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        albums: albumsToReorder,
      },
    });

    expect(response.ok()).toBeTruthy();

    const updatedAlbums = (await response.json()) as Album[];
    expect(Array.isArray(updatedAlbums)).toBeTruthy();
  });

  test('should require authentication for create', async ({ request }) => {
    if (!testCategory) {
      test.skip();
      return;
    }

    const response = await request.post(`${API_BASE_URL}/v1/albums`, {
      data: {
        name: 'Unauthorized Album',
        categoryId: testCategory.id,
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should require authentication for update', async ({ request }) => {
    if (!testAlbum) {
      test.skip();
      return;
    }

    const response = await request.patch(`${API_BASE_URL}/v1/albums/${testAlbum.id}`, {
      data: {
        name: 'Unauthorized Update',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should handle invalid album id', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/v1/albums/invalid-id-123`);

    expect(response.status()).toBe(404);

    const error = await response.json();
    expect(error.message).toContain('not found');
  });

  test('should delete album successfully', async ({ request }) => {
    if (!authToken || !testCategory) {
      test.skip();
      return;
    }

    // Сначда создаем альбом для удаления
    const createResponse = await request.post(`${API_BASE_URL}/v1/albums`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'Album to Delete',
        slug: 'album-to-delete',
        categoryId: testCategory.id,
        isHidden: false,
      },
    });

    expect(createResponse.ok()).toBeTruthy();
    const albumToDelete = (await createResponse.json()) as Album;

    // Удаляем альбом
    const deleteResponse = await request.delete(`${API_BASE_URL}/v1/albums/${albumToDelete.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(deleteResponse.status()).toBe(204);

    // Проверяем, что альбом действительно удален
    const getResponse = await request.get(`${API_BASE_URL}/v1/albums/${albumToDelete.id}`);
    expect(getResponse.status()).toBe(404);
  });
});
