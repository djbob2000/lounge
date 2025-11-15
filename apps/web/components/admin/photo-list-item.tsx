'use client';

import type { Photo } from '@lounge/types';
import {
  PencilIcon,
  StarIcon as StarIconOutline,
  StarIcon as StarIconSolid,
  Trash2Icon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface PhotoListItemProps {
  item: Photo;
  // Add any other props you might need, e.g., onDelete, onToggleSlider
}

export default function PhotoListItem({ item }: PhotoListItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setOpen(false); // Close dialog before starting deletion

    try {
      const response = await fetch(`/api/photos/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Помилка видалення: ${errorData.message || 'Невідома помилка'}`);
        return;
      }

      toast.success(`Фото "${item.filename}" успішно видалено`);
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Помилка видалення фото. Спробуйте ще раз.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 md:p-4 border-b border-border last:border-b-0 bg-card hover:bg-muted/30 transition-colors">
      <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded overflow-hidden flex-shrink-0 bg-secondary">
          <Image
            src={item.thumbnailUrl}
            alt={item.description || `Фото ${item.filename}`}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="font-medium text-sm md:text-base text-foreground truncate"
            title={item.filename}
          >
            {item.filename}
          </h4>
          {item.description && (
            <p
              className="text-xs md:text-sm text-muted-foreground mt-1 max-w-xs md:max-w-md truncate"
              title={item.description}
            >
              {item.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {item.width}×{item.height}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0 ml-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/photos/${item.id}/edit?albumId=${item.albumId}`}>
            <PencilIcon className="h-3 w-3 md:h-4 md:w-4" />
            <span className="sr-only">Редагувати</span>
          </Link>
        </Button>
        <Button variant="outline" size="icon" disabled>
          {' '}
          {/* Placeholder for toggle slider functionality */}
          {item.isSliderImage ? (
            <StarIconSolid className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 dark:text-yellow-400" />
          ) : (
            <StarIconOutline className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          )}
          <span className="sr-only">
            {item.isSliderImage ? 'Прибрати зі слайдера' : 'Додати до слайдера'}
          </span>
        </Button>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" disabled={isDeleting}>
              <Trash2Icon className="h-3 w-3 md:h-4 md:w-4" />
              <span className="sr-only">Видалити</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ви впевнені, що хочете видалити фото?</AlertDialogTitle>
              <AlertDialogDescription>
                Фото &quot;{item.filename}&quot; буде остаточно видалено. Цю дію не можна скасувати.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Скасувати</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Видалення...' : 'Видалити'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
