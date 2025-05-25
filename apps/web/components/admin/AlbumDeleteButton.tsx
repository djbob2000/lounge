"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

interface AlbumDeleteButtonProps {
  albumId: string;
  albumName: string;
}

export default function AlbumDeleteButton({
  albumId,
  albumName,
}: AlbumDeleteButtonProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Ви впевнені, що хочете видалити альбом "${albumName}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const token = await getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/albums/${albumId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Помилка видалення: ${errorData.message || "Невідома помилка"}`);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting album:", error);
      alert("Помилка видалення альбому");
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
      {isDeleting ? "Видалення..." : "Видалити"}
    </button>
  );
}
