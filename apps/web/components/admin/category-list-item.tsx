'use client';

import type { Category } from '@lounge/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import CategoryDeleteButton from './CategoryDeleteButton';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface CategoryListItemProps {
  item: Category;
}

export default function CategoryListItem({ item: category }: CategoryListItemProps) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [showInMenu, setShowInMenu] = useState<boolean>(!!category.showInMenu);
  const [updating, setUpdating] = useState<boolean>(false);

  const toggleShowInMenu = async (value: boolean) => {
    setUpdating(true);
    const prev = showInMenu;
    setShowInMenu(value);
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/categories/${category.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token ?? ''}`,
          },
          body: JSON.stringify({ showInMenu: value }),
        },
      );
      if (!res.ok) {
        setShowInMenu(prev);
        const err = await res.json().catch(() => ({} as any));
        toast.error(err?.message || 'Помилка оновлення категорії');
        return;
      }
      router.refresh();
    } catch (e) {
      setShowInMenu(prev);
      toast.error('Помилка оновлення категорії');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border last:border-b-0 bg-card hover:bg-muted/30 transition-colors">
      <Link href={`/admin/categories/${category.id}/edit`} className="flex items-center flex-grow min-w-0">
        <div className="flex-grow min-w-0">
          <h3 className="font-medium text-sm md:text-base text-foreground dark:text-foreground truncate">{category.name}</h3>
          <p className="text-xs text-muted-foreground md:text-sm truncate">/{category.slug}</p>
        </div>
      </Link>
      <div className="flex items-center space-x-2 flex-shrink-0 mr-2">
        <span className="text-sm text-muted-foreground">В меню</span>
        <Switch checked={showInMenu} onCheckedChange={(v) => toggleShowInMenu(!!v)} disabled={updating} aria-label="Показувати в меню" />
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/categories/${category.id}/edit`}>
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Редагувати</span>
          </Link>
        </Button>
        <CategoryDeleteButton categoryId={category.id} categoryName={category.name} />
      </div>
    </div>
  );
}
