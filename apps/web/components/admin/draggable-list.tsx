'use client';

import { useAuth } from '@clerk/nextjs';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Album, Category, Photo } from '@lounge/types';
import { useEffect, useState } from 'react';
import { SortableItem } from './sortable-item';

type Item = Category | Album | Photo;

interface DraggableListProps {
  items: Item[];
  itemType: 'category' | 'album' | 'photo';
  ItemComponent?: React.ComponentType<{ item: Item; index: number }>;
  renderItem?: (item: Item, index: number) => React.ReactElement;
  onOrderUpdate?: (items: Item[]) => void;
}

export default function DraggableList({
  items,
  itemType,
  ItemComponent,
  renderItem,
  onOrderUpdate,
}: DraggableListProps) {
  const { getToken } = useAuth();
  const [listItems, setListItems] = useState<Item[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setListItems(items);
    setError(null);
  }, [items]);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = listItems.findIndex((item) => item.id === active.id);
    const newIndex = listItems.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Create a new array of items with the new order
    const updatedItems = arrayMove(listItems, oldIndex, newIndex);

    // Optimistically update the UI
    setListItems(updatedItems);
    setError(null);
    setIsUpdating(true);

    // Prepare data for the API
    const updateData = updatedItems.map((item, index) => ({
      id: item.id,
      displayOrder: index,
    }));

    try {
      const token = await getToken();

      // Determine API URL based on item type
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`;

      switch (itemType) {
        case 'category':
          url += '/categories/order/update';
          break;
        case 'album':
          url += '/albums/order/update';
          break;
        case 'photo':
          url += '/photos/order/update';
          break;
      }

      // Send request to the API
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          [itemType === 'category' ? 'categories' : itemType === 'album' ? 'albums' : 'photos']:
            updateData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          requestData: updateData,
        });
        throw new Error(`Error updating order: ${response.statusText} - ${errorText}`);
      }

      // Call the optional callback
      if (onOrderUpdate) {
        onOrderUpdate(updatedItems);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Unable to update order: ${errorMessage}`);
      // Revert to previous state on error
      setListItems(items);
    } finally {
      setIsUpdating(false);
    }
  };

  // Find the active item
  const activeItem = activeId ? listItems.find((item) => item.id === activeId) : null;

  return (
    <div className="relative">
      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">Updating order...</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={listItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={`transition-colors duration-200`}>
            {listItems.map((item, index) => (
              <SortableItem
                key={item.id}
                id={item.id}
                item={item}
                index={index}
                itemType={itemType}
                renderItem={renderItem}
                ItemComponent={ItemComponent}
                isUpdating={isUpdating}
              />
            ))}

            {/* Empty state */}
            {listItems.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <svg
                  className="w-8 h-8 mx-auto mb-2 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Drop here to reorder
              </div>
            )}
          </div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && activeItem && (
            <div className="shadow-lg scale-105 bg-blue-50 border-2 border-blue-200 rounded-lg z-50">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-2 rounded mr-2 cursor-grabbing bg-blue-100">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  {renderItem
                    ? renderItem(
                        activeItem,
                        listItems.findIndex((item) => item.id === activeId),
                      )
                    : ItemComponent && (
                        <ItemComponent
                          item={activeItem}
                          index={listItems.findIndex((item) => item.id === activeId)}
                        />
                      )}
                </div>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
