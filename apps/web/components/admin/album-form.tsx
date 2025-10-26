'use client';

import { useAuth } from '@clerk/nextjs';
import type { Album, Category } from '@lounge/types';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
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

interface AlbumFormProps {
  album?: Album;
  categories: Category[];
  categoryId?: string;
}

export default function AlbumForm({ album, categories, categoryId }: AlbumFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const id = useId();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: album?.name || '',
    slug: album?.slug || '',
    description: album?.description || '',
    categoryId: categoryId || album?.categoryId || '',
    isHidden: album?.isHidden || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrors({ name: "Назва альбому обов'язкова" });
      return false;
    }

    if (!formData.categoryId) {
      setErrors({ categoryId: "Категорія обов'язкова" });
      return false;
    }

    return true;
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

  const processErrorResponse = (errorData: { message?: string | string[] }) => {
    console.log('[AlbumForm] api:errorData', errorData);
    const message = errorData.message;
    if (Array.isArray(message)) {
      const fieldErrors = message.reduce<Record<string, string>>((acc, msg) => {
        const key = detectFieldFromMessage(msg);
        if (key !== 'general') acc[key] = msg;
        return acc;
      }, {});
      if (Object.keys(fieldErrors).length === 0) {
        setErrors({ general: message.join('\\n') });
      } else {
        setErrors(fieldErrors);
      }
    } else {
      setErrors({ general: message || 'Помилка збереження альбому' });
    }
  };

  const submitData = async () => {
    const token = await getToken();
    console.log('[AlbumForm] api:token', token ? `len:${token.length}` : 'null');

    const url = album
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/albums/${album.id}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/albums`;

    const method = album ? 'PATCH' : 'POST';

    if (!token) {
      console.error('[AlbumForm] api:no-token');
      setErrors({ general: 'Authentication token not found. Please try logging in again.' });
      return;
    }

    console.log('[AlbumForm] api:request', { url, method, payload: formData });

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    console.log('[AlbumForm] api:response', { ok: response.ok, status: response.status });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      processErrorResponse(errorData);
      return;
    }

    router.push('/admin/albums');
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await submitData();
    } catch (error) {
      console.error('Error saving album:', error);
      setErrors({ general: 'Помилка збереження альбому' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <FormItem>
        <FormLabel htmlFor={`${id}-name`}>
          Назва альбому <span className="text-destructive">*</span>
        </FormLabel>
        <FormControl>
          <Input
            id={`${id}-name`}
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Введіть назву альбому"
            className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
        </FormControl>
        <FormMessage>{errors.name}</FormMessage>
      </FormItem>

      <FormItem>
        <FormLabel htmlFor={`${id}-categoryId`}>
          Категорія <span className="text-destructive">*</span>
        </FormLabel>
        <FormControl>
          <CategorySelect
            id={`${id}-categoryId`}
            categories={categories}
            value={formData.categoryId}
            onChange={(categoryId) => {
              setFormData((prev) => ({ ...prev, categoryId }));
              // Clear error when user selects a category
              if (errors.categoryId) {
                setErrors((prev) => ({ ...prev, categoryId: '' }));
              }
            }}
            error={errors.categoryId}
            placeholder="Оберіть категорію"
            disabled={!!categoryId}
          />
        </FormControl>
        <FormMessage>{errors.categoryId}</FormMessage>
      </FormItem>

      <FormItem>
        <FormLabel htmlFor={`${id}-slug`}>Slug (URL)</FormLabel>
        <FormControl>
          <Input
            id={`${id}-slug`}
            name="slug"
            value={formData.slug}
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
        <FormLabel htmlFor={`${id}-description`}>Опис</FormLabel>
        <FormControl>
          <Textarea
            id={`${id}-description`}
            name="description"
            value={formData.description}
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
              id={`${id}-isHidden`}
              checked={formData.isHidden}
              onCheckedChange={(checked) => {
                setFormData((prev) => ({ ...prev, isHidden: !!checked }));
              }}
            />
          </FormControl>
          <FormLabel htmlFor={`${id}-isHidden`} className="text-sm font-normal">
            Приховати альбом
          </FormLabel>
        </div>
        <FormDescription>Якщо увімкнено, альбом не буде відображатися на сайті</FormDescription>
      </FormItem>

      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Скасувати
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Збереження...' : album ? 'Оновити' : 'Створити'}
        </Button>
      </div>
    </form>
  );
}
