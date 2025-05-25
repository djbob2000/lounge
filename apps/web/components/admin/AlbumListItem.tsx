import Link from "next/link";
import { Album } from "@lounge/types";
import { Button } from "../../components/ui/button";
import { PencilIcon, Trash2Icon, EyeIcon, EyeOffIcon } from "lucide-react";

interface AlbumListItemProps {
  item: Album;
  index: number;
  // Add any other props you might need, e.g., onDelete, onToggleVisibility
}

export default function AlbumListItem({ item, index }: AlbumListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center">
        {item.coverImageUrl && (
          <div className="w-16 h-12 mr-4 rounded overflow-hidden flex-shrink-0">
            <img
              src={item.coverImageUrl}
              alt={`Обкладинка ${item.name}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-grow">
          <h3 className="font-medium text-sm md:text-base">{item.name}</h3>
          <p className="text-xs text-gray-500 md:text-sm">/{item.slug}</p>
          {item.description && (
            <p className="text-xs text-gray-600 mt-1 hidden md:block">
              {item.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/albums/${item.id}/edit`}>
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Редагувати</span>
          </Link>
        </Button>
        {/* Placeholder for delete and visibility toggle functionality */}
        <Button variant="outline" size="icon" disabled>
          {item.isHidden ? (
            <EyeOffIcon className="h-4 w-4" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
          <span className="sr-only">
            {item.isHidden ? "Показати" : "Приховати"}
          </span>
        </Button>
        <Button variant="destructive" size="icon" disabled>
          <Trash2Icon className="h-4 w-4" />
          <span className="sr-only">Видалити</span>
        </Button>
      </div>
    </div>
  );
}
