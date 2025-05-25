import { Album } from "@lounge/types";
import PhotoForm from "../../../../components/admin/PhotoForm";

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

export default async function NewPhotoPage() {
  const albums = await getAlbums();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Upload New Photo</h1>
        <p className="text-gray-600 mt-2">
          Upload a new photo to one of your albums
        </p>
      </div>

      <PhotoForm albums={albums} />
    </div>
  );
}
