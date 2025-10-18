'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Album, Category, Photo } from '@lounge/types';

type Item = Category | Album | Photo;

interface SortableItemProps {
  id: string;
  item: Item;
  index: number;
  itemType: 'category' | 'album' | 'photo';
  renderItem?: (item: Item, index: number) => React.ReactElement;
  ItemComponent?: React.ComponentType<{ item: Item; index: number }>;
  isUpdating: boolean;
}

export function SortableItem({
  id,
  item,
  index,
  itemType,
  renderItem,
  ItemComponent,
  isUpdating,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative transition-all duration-200 ${
        isDragging
          ? 'shadow-lg scale-105 bg-blue-50 border-2 border-blue-200 rounded-lg z-50'
          : 'hover:bg-gray-50'
      } ${isUpdating ? 'opacity-75' : ''}`}
    >
      <div className="flex items-center">
        <div
          {...attributes}
          {...listeners}
          className={`flex-shrink-0 p-2 rounded mr-2 transition-colors duration-200 ${
            isDragging ? 'cursor-grabbing bg-blue-100' : 'cursor-grab hover:bg-gray-100'
          }`}
          title="Drag to reorder"
          aria-label={`Drag to reorder ${itemType}`}
          role="button"
          tabIndex={0}
        >
          <svg
            className={`w-4 h-4 transition-colors duration-200 ${
              isDragging ? 'text-blue-600' : 'text-gray-400'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
        </div>
        <div className="flex-1">
          {renderItem
            ? renderItem(item, index)
            : ItemComponent && <ItemComponent item={item} index={index} />}
        </div>
      </div>
    </div>
  );
}
