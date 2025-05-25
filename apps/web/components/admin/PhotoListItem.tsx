import Link from "next/link";
import { Photo, Album } from "@lounge/types";
import { Button } from "../../components/ui/button";
import {
  PencilIcon,
  Trash2Icon,
  StarIcon as StarIconSolid,
} from "lucide-react"; // Solid star for isSliderImage
import { StarIcon as StarIconOutline } from "lucide-react"; // Outline star for not isSliderImage

interface PhotoListItemProps {
  item: Photo;
  index: number;
  album?: Album; // Optional: for context like linking back to album or specific actions
  // Add any other props you might need, e.g., onDelete, onToggleSlider
}

export default function PhotoListItem({
  item,
  index,
  album,
}: PhotoListItemProps) {
  return (
    <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded overflow-hidden flex-shrink-0 bg-gray-100">
          <img
            src={item.thumbnailUrl}
            alt={item.description || `Фото ${item.filename}`}
            className="w-full h-full object-cover"
            width={80}
            height={80}
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="font-medium text-sm md:text-base truncate"
            title={item.filename}
          >
            {item.filename}
          </h4>
          {item.description && (
            <p
              className="text-xs md:text-sm text-gray-600 mt-1 max-w-xs md:max-w-md truncate"
              title={item.description}
            >
              {item.description}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {item.width}×{item.height}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0 ml-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/photos/${item.id}/edit?albumId=${item.albumId}`}>
            <PencilIcon className="h-3 w-3 md:h-4 md:w-4" />
            <span className="sr-only">Редагувати</span>
          </Link>
        </Button>
        <Button variant="outline" size="icon" disabled>
          {" "}
          {/* Placeholder for toggle slider functionality */}
          {item.isSliderImage ? (
            <StarIconSolid className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
          ) : (
            <StarIconOutline className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
          )}
          <span className="sr-only">
            {item.isSliderImage ? "Прибрати зі слайдера" : "Додати до слайдера"}
          </span>
        </Button>
        <Button variant="destructive" size="icon" disabled>
          {" "}
          {/* Placeholder for delete functionality */}
          <Trash2Icon className="h-3 w-3 md:h-4 md:w-4" />
          <span className="sr-only">Видалити</span>
        </Button>
      </div>
    </div>
  );
}
