"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PhotoDeleteButtonProps {
  photoId: string;
  photoName: string;
  className?: string;
}

export default function PhotoDeleteButton({
  photoId,
  photoName,
  className = "text-red-500 hover:text-red-700 text-sm",
}: PhotoDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${photoName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete photo");
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`${className} ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
