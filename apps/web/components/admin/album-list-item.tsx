import type { Album } from '@lounge/types';
import { EyeIcon, EyeOffIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AlbumListItemProps {
  item: Album;
  index: number;
  // Add any other props you might need, e.g., onDelete, onToggleVisibility
}

export default function AlbumListItem({ item, index }: AlbumListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0">
      <Link href={`/admin/albums/${item.id}`} className="flex items-center flex-grow min-w-0">
        {' '}
        {/* Added Link and classes */}
        {item.coverImageUrl && (
          <div className="w-16 h-12 mr-4 rounded overflow-hidden flex-shrink-0">
            <img
              src={item.coverImageUrl}
              alt={`Cover for ${item.name}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-grow min-w-0">
          {' '}
          {/* Added min-w-0 for proper truncation if needed */}
          <h3 className="font-medium text-sm md:text-base text-foreground truncate">{item.name}</h3>{' '}
          {/* Added truncate */}
          <p className="text-xs text-gray-500 md:text-sm truncate">/{item.slug}</p>{' '}
          {/* Added truncate */}
          {item.description && (
            <p className="text-xs text-gray-600 mt-1 hidden md:block truncate">
              {' '}
              {/* Added truncate */}
              {item.description}
            </p>
          )}
        </div>
      </Link>{' '}
      {/* Closing Link tag */}
      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/albums/${item.id}/edit`}>
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Link>
        </Button>
        {/* Placeholder for delete and visibility toggle functionality */}
        <Button variant="outline" size="icon" disabled>
          {item.isHidden ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          <span className="sr-only">{item.isHidden ? 'Show' : 'Hide'}</span>
        </Button>
        <Button variant="destructive" size="icon" disabled>
          <Trash2Icon className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}
