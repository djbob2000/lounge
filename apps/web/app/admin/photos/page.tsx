import Link from "next/link";
import { Photo, Album } from "@lounge/types";
import PhotoClientPage from "./PhotoClientPage";

// Function to fetch photos from the API
async function getPhotos(): Promise<Photo[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/photos`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch photos");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
}

// Function to fetch albums from the API
async function getAlbums(): Promise<Album[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/albums`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch albums");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching albums:", error);
    return [];
  }
}

// Function to fetch photos by album from the API
async function getPhotosByAlbum(albumId: string): Promise<Photo[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/photos/album/${albumId}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch photos by album");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching photos by album:", error);
    return [];
  }
}

// Function to fetch slider photos from the API
async function getSliderPhotos(): Promise<Photo[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/photos/slider`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch slider photos");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching slider photos:", error);
    return [];
  }
}

// Group photos by album
function groupPhotosByAlbum(photos: Photo[], albums: Album[]) {
  const albumMap = new Map(albums.map((album) => [album.id, album]));
  const grouped = new Map<string, { album: Album; photos: Photo[] }>();

  photos.forEach((photo) => {
    const album = albumMap.get(photo.albumId);
    if (album) {
      if (!grouped.has(album.id)) {
        grouped.set(album.id, { album, photos: [] });
      }
      grouped.get(album.id)!.photos.push(photo);
    }
  });

  // Sort photos within each album by display order
  grouped.forEach((group) => {
    group.photos.sort((a, b) => a.displayOrder - b.displayOrder);
  });

  return Array.from(grouped.values()).sort(
    (a, b) => a.album.displayOrder - b.album.displayOrder
  );
}

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ albumId?: string; slider?: string }>;
}) {
  const { albumId, slider } = await searchParams;
  let photos: Photo[] = [];
  let allAlbums: Album[] = [];
  let currentAlbum: Album | undefined = undefined;
  let title = "All Photos";
  let showGrouped = false;
  const isSliderPage = slider === "true";

  if (isSliderPage) {
    photos = await getSliderPhotos();
    title = "Slider Photos";
  } else if (albumId) {
    allAlbums = await getAlbums();
    currentAlbum = allAlbums.find((a) => a.id === albumId);
    if (currentAlbum) {
      photos = await getPhotosByAlbum(albumId);
      title = `Photos in "${currentAlbum.name}"`;
    } else {
      photos = [];
      title = "Album Not Found";
    }
  } else {
    [photos, allAlbums] = await Promise.all([getPhotos(), getAlbums()]);
    showGrouped = true;
  }

  const groupedPhotos = showGrouped
    ? groupPhotosByAlbum(photos, allAlbums)
    : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-600 mt-1">
            {showGrouped
              ? `${photos.length} photos across ${groupedPhotos?.length || 0} albums`
              : `${photos.length} photos`}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/admin/photos?slider=true"
            className={`px-4 py-2 rounded-md transition-colors ${
              isSliderPage
                ? "bg-pink-100 text-pink-700 border border-pink-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Slider Photos
          </Link>
          <Link
            href="/admin/photos"
            className={`px-4 py-2 rounded-md transition-colors ${
              !albumId && !isSliderPage
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Photos
          </Link>
          <Link
            href={
              albumId
                ? `/admin/photos/new?albumId=${albumId}`
                : isSliderPage
                  ? "/admin/photos/new?slider=true"
                  : "/admin/photos/new"
            }
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Upload Photo
          </Link>
        </div>
      </div>

      {showGrouped && groupedPhotos ? (
        // Grouped view by album
        <div className="space-y-8">
          {groupedPhotos.map(({ album, photos: albumPhotos }) => (
            <div
              key={album.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {album.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {albumPhotos.length} photos
                    </p>
                  </div>
                  <Link
                    href={`/admin/photos?albumId=${album.id}`}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    View album →
                  </Link>
                </div>
              </div>
              <PhotoClientPage initialPhotos={albumPhotos} album={album} />
            </div>
          ))}
        </div>
      ) : (
        // Single list view (for specific album, slider, or if initial load is empty)
        <PhotoClientPage
          initialPhotos={photos}
          album={currentAlbum}
          isSliderPage={isSliderPage}
        />
      )}
    </div>
  );
}
