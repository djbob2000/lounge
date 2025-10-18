'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface CategoryDeleteButtonProps {
  categoryId: string;
  categoryName: string;
}

export default function CategoryDeleteButton({
  categoryId,
  categoryName,
}: CategoryDeleteButtonProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Ви впевнені, що хочете видалити категорію "${categoryName}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const token = await getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/categories/${categoryId}`,
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

      router.refresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Помилка видалення категорії');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? 'Видалення...' : 'Видалити'}
    </button>
  );
}
