'use client';

import { useAuth } from '@clerk/nextjs';
import type { Album, Category } from '@lounge/types';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useId, useOptimistic } from 'react';
import { useFormStatus } from 'react-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CategorySelect from './category-select';

interface AlbumFormData {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  isHidden: boolean;
}

interface AlbumFormProps {
  album?: Album;
  categories: Category[];
  categoryId?: string;
}

// Компонент кнопки з автоматичним керуванням станом
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Збереження...' : 'Створити'}
    </Button>
  );
}

// Компонент кнопки редагування з автоматичним керуванням станом
function EditSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Оновлення...' : 'Оновити'}
    </Button>
  );
}

const extractFormData = (formData: FormData): AlbumFormData => {
  return {
    name: formData.get('name')?.toString() || '',
    slug: formData.get('slug')?.toString() || '',
    description: formData.get('description')?.toString() || '',
    categoryId: formData.get('categoryId')?.toString() || '',
    isHidden: formData.get('isHidden') === 'on',
  };
};

const validateForm = (data: AlbumFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = "Назва альбому обов'язкова";
  }

  if (!data.categoryId) {
    errors.categoryId = "Категорія обов'язкова";
  }

  return errors;
};

const detectFieldFromMessage = (
  msg: string,
): 'name' | 'slug' | 'categoryId' | 'description' | 'general' => {
  const lower = msg.toLowerCase();
  if (lower.includes('назва') || lower.includes('name')) return 'name';
  if (lower.includes('slug')) return 'slug';
  if (lower.includes('categoryid') || lower.includes('category id') || lower.includes('category'))
    return 'categoryId';
  if (lower.includes('description') || lower.includes('опис')) return 'description';
  return 'general';
};

const getAuthToken = async (getToken: () => Promise<string | null>): Promise<string | null> => {
  return await getToken();
};

const processApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message;

    if (Array.isArray(message)) {
      const fieldErrors = message.reduce<Record<string, string>>((acc, msg) => {
        const key = detectFieldFromMessage(msg);
        if (key !== 'general') acc[key] = msg;
        return acc;
      }, {});

      if (Object.keys(fieldErrors).length === 0) {
        return { general: message.join('\n') };
      } else {
        return fieldErrors;
      }
    } else {
      return { general: message || 'Помилка збереження альбому' };
    }
  }
  return {};
};

const createApiRequest = async (
  url: string,
  method: string,
  token: string,
  data: AlbumFormData,
) => {
  console.log('[AlbumForm] api:request', { url, method, payload: data });

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  console.log('[AlbumForm] api:response', { ok: response.ok, status: response.status });

  return response;
};

export default function AlbumForm({ album, categories, categoryId }: AlbumFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();

  // Генеруємо унікальні ID для компонентів
  const nameId = useId();
  const categorySelectId = useId();
  const slugId = useId();
  const descriptionId = useId();
  const isHiddenId = useId();

  const initialFormData: AlbumFormData = {
    name: album?.name || '',
    slug: album?.slug || '',
    description: album?.description || '',
    categoryId: categoryId || album?.categoryId || '',
    isHidden: album?.isHidden || false,
  };

  // Оптимістичні оновлення форми
  const [optimisticFormData, setOptimisticFormData] = useOptimistic(
    initialFormData,
    (state, newData: Partial<AlbumFormData>) => ({ ...state, ...newData }),
  );

  // Action функція для обробки форми
  const submitAlbum = async (
    _previousState: Record<string, string> | null,
    formData: FormData,
  ): Promise<Record<string, string>> => {
    // Витягуємо дані з formData
    const data = extractFormData(formData);

    // Валідація
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      return errors;
    }

    // Отримуємо токен автентифікації
    const token = await getAuthToken(getToken);
    if (!token) {
      return { general: 'Authentication token not found. Please try logging in again.' };
    }

    // Визначаємо URL та метод
    const url = album
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/albums/${album.id}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/albums`;

    const method = album ? 'PATCH' : 'POST';

    try {
      // Виконуємо API запит
      const response = await createApiRequest(url, method, token, data);

      // Обробляємо відповідь
      return await processApiResponse(response);
    } catch (error) {
      console.error('Error saving album:', error);
      return { general: 'Помилка збереження альбому' };
    }
  };

  const [errors, submitAction] = useActionState(submitAlbum, {});

  // Обробка зміни полів з оптимістичними оновленнями
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setOptimisticFormData({
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Перенаправлення при успішному збереженні (коли немає помилок)
  if (Object.keys(errors).length === 0 && album) {
    router.push('/admin/albums');
    router.refresh();
  }

  return (
    <form action={submitAction} className="space-y-6">
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <FormItem>
        <FormLabel htmlFor={nameId}>
          Назва альбому <span className="text-destructive">*</span>
        </FormLabel>
        <FormControl>
          <Input
            id={nameId}
            name="name"
            value={optimisticFormData.name}
            onChange={handleInputChange}
            placeholder="Введіть назву альбому"
            className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
        </FormControl>
        <FormMessage>{errors.name}</FormMessage>
      </FormItem>

      <FormItem>
        <FormLabel htmlFor={categorySelectId}>
          Категорія <span className="text-destructive">*</span>
        </FormLabel>
        <FormControl>
          <input type="hidden" name="categoryId" value={optimisticFormData.categoryId} />
          <CategorySelect
            id={categorySelectId}
            categories={categories}
            value={optimisticFormData.categoryId}
            onChange={(categoryId) => {
              setOptimisticFormData({ categoryId });
            }}
            error={errors.categoryId}
            placeholder="Оберіть категорію"
            disabled={!!categoryId}
          />
        </FormControl>
        <FormMessage>{errors.categoryId}</FormMessage>
      </FormItem>

      <FormItem>
        <FormLabel htmlFor={slugId}>Slug (URL)</FormLabel>
        <FormControl>
          <Input
            id={slugId}
            name="slug"
            value={optimisticFormData.slug}
            onChange={handleInputChange}
            placeholder="Залиште порожнім для автоматичної генерації"
            className={errors.slug ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
        </FormControl>
        <FormMessage>{errors.slug}</FormMessage>
        <FormDescription>
          Якщо залишити порожнім, буде згенеровано автоматично з назви
        </FormDescription>
      </FormItem>

      <FormItem>
        <FormLabel htmlFor={descriptionId}>Опис</FormLabel>
        <FormControl>
          <Textarea
            id={descriptionId}
            name="description"
            value={optimisticFormData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Введіть опис альбому (необов'язково)"
            className={
              errors.description ? 'border-destructive focus-visible:ring-destructive' : ''
            }
          />
        </FormControl>
        <FormMessage>{errors.description}</FormMessage>
      </FormItem>

      <FormItem>
        <div className="flex items-center space-x-2">
          <FormControl>
            <Checkbox
              id={isHiddenId}
              name="isHidden"
              checked={optimisticFormData.isHidden}
              onCheckedChange={(checked) => {
                setOptimisticFormData({ isHidden: !!checked });
              }}
            />
          </FormControl>
          <FormLabel htmlFor={isHiddenId} className="text-sm font-normal">
            Приховати альбом
          </FormLabel>
        </div>
        <FormDescription>Якщо увімкнено, альбом не буде відображатися на сайті</FormDescription>
      </FormItem>

      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Скасувати
        </Button>
        {album ? <EditSubmitButton /> : <SubmitButton />}
      </div>
    </form>
  );
}
