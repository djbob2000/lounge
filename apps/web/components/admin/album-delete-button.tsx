'use client';

import { useAuth } from '@clerk/nextjs';
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

interface AlbumDeleteButtonProps {
  albumId: string;
  albumName: string;
}

export default function AlbumDeleteButton({ albumId, albumName }: AlbumDeleteButtonProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setOpen(false); // Close dialog before starting deletion

    try {
      const token = await getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/albums/${albumId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Помилка видалення: ${errorData.message || 'Невідома помилка'}`);
        return;
      }

      toast.success(`Альбом "${albumName}" успішно видалено`);
      router.refresh();
    } catch (error) {
      console.error('Error deleting album:', error);
      toast.error('Помилка видалення альбому');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Видалити
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ви впевнені, що хочете видалити альбом?</AlertDialogTitle>
          <AlertDialogDescription>
            Альбом &quot;{albumName}&quot; буде остаточно видалено. Цю дію не можна скасувати.
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
