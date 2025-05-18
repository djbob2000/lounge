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

    // No drag or drag to the same position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Create a new array of items with the new order
    const updatedItems = Array.from(listItems);
    const [reorderedItem] = updatedItems.splice(source.index, 1);
    if (reorderedItem) {
      updatedItems.splice(destination.index, 0, reorderedItem);
    }

    // Optimistically update the UI
    setListItems(updatedItems);

    // Prepare data for the API
    const updateData = updatedItems.map((item, index) => ({
      id: item.id,
      displayOrder: index,
    }));

    try {
      // Determine API URL based on item type
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

      // Send request to the API
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
        throw new Error(`Error updating order: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      // Revert to previous state on error
      setListItems(items);
      alert("Unable to update order. Please try again.");
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
