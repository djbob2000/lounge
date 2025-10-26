'use client';

import { useAuth } from '@clerk/nextjs';
import type { Album, Category } from '@lounge/types';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useOptimistic } from 'react';
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

export default function AlbumForm({ album, categories, categoryId }: AlbumFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();

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

  // Функція валідації
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

  // Визначення поля для помилки на основі повідомлення
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

  // Action функція для обробки форми
  const submitAlbum = async (
    previousState: Record<string, string> | null,
    formData: FormData,
  ): Promise<Record<string, string>> => {
    // Витягуємо дані з formData
    const data: AlbumFormData = {
      name: formData.get('name')?.toString() || '',
      slug: formData.get('slug')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      categoryId: formData.get('categoryId')?.toString() || '',
      isHidden: formData.get('isHidden') === 'on',
    };

    // Валідація
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      return errors;
    }

    const token = await getToken();
    if (!token) {
      return { general: 'Authentication token not found. Please try logging in again.' };
    }

    const url = album
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/albums/${album.id}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/albums`;

    const method = album ? 'PATCH' : 'POST';

    try {
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

      // Успішне збереження - перенаправлення буде здійснено після успішного стану
      return {};
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
        <FormLabel htmlFor="name">
          Назва альбому <span className="text-destructive">*</span>
        </FormLabel>
        <FormControl>
          <Input
            id="name"
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
        <FormLabel htmlFor="categoryId">
          Категорія <span className="text-destructive">*</span>
        </FormLabel>
        <FormControl>
          <input type="hidden" name="categoryId" value={optimisticFormData.categoryId} />
          <CategorySelect
            id="categoryId"
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
        <FormLabel htmlFor="slug">Slug (URL)</FormLabel>
        <FormControl>
          <Input
            id="slug"
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
        <FormLabel htmlFor="description">Опис</FormLabel>
        <FormControl>
          <Textarea
            id="description"
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
              id="isHidden"
              name="isHidden"
              checked={optimisticFormData.isHidden}
              onCheckedChange={(checked) => {
                setOptimisticFormData({ isHidden: !!checked });
              }}
            />
          </FormControl>
          <FormLabel htmlFor="isHidden" className="text-sm font-normal">
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
