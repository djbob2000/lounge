'use client';
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
} from '../ui/alert-dialog';

interface PhotoDeleteButtonProps {
  photoId: string;
  photoName: string;
  className?: string;
}

export default function PhotoDeleteButton({
  photoId,
  photoName,
  className = 'text-red-500 hover:text-red-700 text-sm',
}: PhotoDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setOpen(false); // Close dialog before starting deletion

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Помилка видалення: ${errorData.message || 'Невідома помилка'}`);
        return;
      }

      toast.success(`Фото '${photoName}' успішно видалено`);
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className={`${className} ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ви впевнені, що хочете видалити фото?</AlertDialogTitle>
          <AlertDialogDescription>
            Фото &quot;{photoName}&quot; буде остаточно видалено. Цю дію не можна скасувати.
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
  );
}
