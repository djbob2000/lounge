"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from "react-beautiful-dnd";
import { Category, Album, Photo } from "@lounge/types";

type Item = Category | Album | Photo;

interface DraggableListProps {
  items: Item[];
  itemType: "category" | "album" | "photo";
  renderItem: (item: Item, index: number) => React.ReactNode;
}

export default function DraggableList({
  items,
  itemType,
  renderItem,
}: DraggableListProps) {
  const [listItems, setListItems] = useState<Item[]>([]);

  useEffect(() => {
    setListItems(items);
  }, [items]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    // Немає перетягування або перетягування до тієї самої позиції
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Створюємо новий масив елементів з новим порядком
    const updatedItems = Array.from(listItems);
    const [reorderedItem] = updatedItems.splice(source.index, 1);
    if (reorderedItem) {
      updatedItems.splice(destination.index, 0, reorderedItem);
    }

    // Оновлюємо UI оптимістично
    setListItems(updatedItems);

    // Підготовка даних для API
    const updateData = updatedItems.map((item, index) => ({
      id: item.id,
      displayOrder: index,
    }));

    try {
      // Визначаємо URL API залежно від типу елемента
      let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}`;

      switch (itemType) {
        case "category":
          url += "/categories/order";
          break;
        case "album":
          url += "/albums/order";
          break;
        case "photo":
          url += "/photos/order";
          break;
      }

      // Надсилаємо запит до API
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [itemType + "s"]: updateData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Помилка оновлення порядку: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Помилка при оновленні порядку:", error);
      // Повертаємо попередній стан при помилці
      setListItems(items);
      alert("Не вдалося оновити порядок. Спробуйте ще раз.");
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-list">
        {(provided: DroppableProvided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {listItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided: DraggableProvided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {renderItem(item, index)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
