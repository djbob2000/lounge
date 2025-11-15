'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';

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
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/categories/${categoryId}`,
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
    <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting}>
      <Trash2Icon className="h-4 w-4" />
      <span className="sr-only">Видалити</span>
    </Button>
  );
}
