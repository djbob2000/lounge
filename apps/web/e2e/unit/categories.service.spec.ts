import type { Category } from '@lounge/types';
import { expect, test } from '@playwright/test';

test.describe('CategoriesService Unit Tests', () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const TEST_CATEGORY_NAME = 'Test Category Unit';
  const TEST_CATEGORY_SLUG = 'test-category-unit';

  let testCategory: Category | null = null;
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
  });

  test.afterAll(async ({ request }) => {
    // Очистка: удаляем тестовую категорию если она существует
    if (testCategory?.id && authToken) {
      await request.delete(`${API_BASE_URL}/v1/categories/${testCategory.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    }
  });

  test('should create category successfully', async ({ request }) => {
    if (!authToken) {
      test.skip();
      return;
    }

    const response = await request.post(`${API_BASE_URL}/v1/categories`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: TEST_CATEGORY_NAME,
        slug: TEST_CATEGORY_SLUG,
        showInMenu: true,
      },
    });

    expect(response.ok()).toBeTruthy();

    const category = (await response.json()) as Category;
    testCategory = category;

    expect(category).toBeDefined();
    expect(category.name).toBe(TEST_CATEGORY_NAME);
    expect(category.slug).toBe(TEST_CATEGORY_SLUG);
    expect(category.showInMenu).toBe(true);
    expect(category.displayOrder).toBeDefined();
  });

  test('should get all categories', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/v1/categories`);

    expect(response.ok()).toBeTruthy();

    const categories = (await response.json()) as Category[];
    expect(Array.isArray(categories)).toBeTruthy();
    expect(categories.length).toBeGreaterThan(0);

    // Проверяем структуру категорий
    categories.forEach((category) => {
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('slug');
      expect(category).toHaveProperty('showInMenu');
      expect(category).toHaveProperty('displayOrder');
    });
  });

  test('should get category by id', async ({ request }) => {
    if (!testCategory) {
      test.skip();
      return;
    }

    const response = await request.get(`${API_BASE_URL}/v1/categories/${testCategory.id}`);

    expect(response.ok()).toBeTruthy();

    const category = (await response.json()) as Category;
    expect(category.id).toBe(testCategory.id);
    expect(category.name).toBe(testCategory.name);
    expect(category.slug).toBe(testCategory.slug);
  });

  test('should get category by slug', async ({ request }) => {
    if (!testCategory) {
      test.skip();
      return;
    }

    const response = await request.get(`${API_BASE_URL}/v1/categories/slug/${testCategory.slug}`);

    expect(response.ok()).toBeTruthy();

    const category = (await response.json()) as Category;
    expect(category.slug).toBe(testCategory.slug);
    expect(category.name).toBe(testCategory.name);
  });

  test('should update category', async ({ request }) => {
    if (!authToken || !testCategory) {
      test.skip();
      return;
    }

    const updatedName = 'Updated Test Category';
    const response = await request.patch(`${API_BASE_URL}/v1/categories/${testCategory.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: updatedName,
      },
    });

    expect(response.ok()).toBeTruthy();

    const updatedCategory = (await response.json()) as Category;
    expect(updatedCategory.name).toBe(updatedName);
    expect(updatedCategory.id).toBe(testCategory.id);

    // Обновляем тестовую категорию
    testCategory = updatedCategory;
  });

  test('should handle duplicate slug error', async ({ request }) => {
    if (!authToken || !testCategory) {
      test.skip();
      return;
    }

    // Пытаемся создать категорию с тем же slug
    const response = await request.post(`${API_BASE_URL}/v1/categories`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'Duplicate Category',
        slug: testCategory.slug, // Используем существующий slug
      },
    });

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.message).toContain('already exists');
  });

  test('should handle invalid category id', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/v1/categories/invalid-id-123`);

    expect(response.status()).toBe(404);

    const error = await response.json();
    expect(error.message).toContain('not found');
  });

  test('should require authentication for create', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/v1/categories`, {
      data: {
        name: 'Unauthorized Category',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should require authentication for update', async ({ request }) => {
    if (!testCategory) {
      test.skip();
      return;
    }

    const response = await request.patch(`${API_BASE_URL}/v1/categories/${testCategory.id}`, {
      data: {
        name: 'Unauthorized Update',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should delete category successfully', async ({ request }) => {
    if (!authToken || !testCategory) {
      test.skip();
      return;
    }

    // Сначала создаем категорию без альбомов для удаления
    const createResponse = await request.post(`${API_BASE_URL}/v1/categories`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'Category to Delete',
        slug: 'category-to-delete',
      },
    });

    expect(createResponse.ok()).toBeTruthy();
    const categoryToDelete = (await createResponse.json()) as Category;

    // Удаляем категорию
    const deleteResponse = await request.delete(
      `${API_BASE_URL}/v1/categories/${categoryToDelete.id}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    expect(deleteResponse.status()).toBe(204);

    // Проверяем, что категория действительно удалена
    const getResponse = await request.get(`${API_BASE_URL}/v1/categories/${categoryToDelete.id}`);
    expect(getResponse.status()).toBe(404);
  });
});
