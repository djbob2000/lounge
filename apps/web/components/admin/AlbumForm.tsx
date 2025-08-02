'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Album, Category } from '@lounge/types';
import { useAuth } from '@clerk/nextjs';
import CategorySelect from './CategorySelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { AlertCircle } from 'lucide-react';

interface AlbumFormProps {
  album?: Album;
  categories: Category[];
  defaultCategoryId?: string;
}

export default function AlbumForm({
  album,
  categories,
  defaultCategoryId,
}: AlbumFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: album?.name || '',
    slug: album?.slug || '',
    description: album?.description || '',
    categoryId: album?.categoryId || defaultCategoryId || '',
    isHidden: album?.isHidden || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate required fields
    if (!formData.name.trim()) {
      setErrors({ name: "Назва альбому обов'язкова" });
      setIsLoading(false);
      return;
    }

    if (!formData.categoryId) {
      setErrors({ categoryId: "Категорія обов'язкова" });
      setIsLoading(false);
      return;
    }

    try {
      const token = await getToken();

      const url = album
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/albums/${album.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/albums`;

      const method = album ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message && Array.isArray(errorData.message)) {
          const fieldErrors: Record<string, string> = {};
          errorData.message.forEach((msg: string) => {
            if (msg.includes('назва') || msg.includes('name')) {
              fieldErrors.name = msg;
            } else if (msg.includes('slug')) {
              fieldErrors.slug = msg;
            } else if (msg.includes('categoryId')) {
              fieldErrors.categoryId = msg;
            } else if (msg.includes('description')) {
              fieldErrors.description = msg;
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({
            general: errorData.message || 'Помилка збереження альбому',
          });
        }
        return;
      }

      router.push('/admin/albums');
      router.refresh();
    } catch (error) {
      console.error('Error saving album:', error);
      setErrors({ general: 'Помилка збереження альбому' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
        <FormLabel htmlFor="name">
          Назва альбому <span className="text-destructive">*</span>
        </FormLabel>
        <FormControl>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Введіть назву альбому"
            className={
              errors.name
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            }
          />
        </FormControl>
        <FormMessage>{errors.name}</FormMessage>
      </FormItem>

      <FormItem>
        <FormLabel>
          Категорія <span className="text-destructive">*</span>
        </FormLabel>
        <FormControl>
          <CategorySelect
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
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="Залиште порожнім для автоматичної генерації"
            className={
              errors.slug
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            }
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
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Введіть опис альбому (необов'язково)"
            className={
              errors.description
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
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
              checked={formData.isHidden}
              onCheckedChange={(checked) => {
                setFormData((prev) => ({ ...prev, isHidden: !!checked }));
              }}
            />
          </FormControl>
          <FormLabel htmlFor="isHidden" className="text-sm font-normal">
            Приховати альбом
          </FormLabel>
        </div>
        <FormDescription>
          Якщо увімкнено, альбом не буде відображатися на сайті
        </FormDescription>
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
