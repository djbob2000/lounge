"use client";

// export const runtime = 'edge';

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Album, Photo, Category } from "@lounge/types";
import PhotoViewer from "../../../components/PhotoViewer";
// import { 照片元数据T } from "@/../api/src/photos/types";
// import { 相册T } from "@/../api/src/albums/types";

interface PageProps {
  params: {
    categorySlug: string;
    albumSlug: string;
  };
}

export default async function Page({ params }: PageProps) {
  // const { categorySlug, albumSlug } = params;

  // console.log('Page params', params);

  const [category, setCategory] = useState<Category | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch category
        const categoryResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/categories/${params.categorySlug}`
        );

        if (!categoryResponse.ok) {
          notFound();
        }

        const categoryData = await categoryResponse.json();
        setCategory(categoryData);

        // Fetch album
        const albumResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/albums/${params.albumSlug}`
        );

        if (!albumResponse.ok) {
          notFound();
        }

        const albumData = await albumResponse.json();
        setAlbum(albumData);

        // Fetch photos
        const photosResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/photos?albumId=${albumData.id}`
        );

        if (photosResponse.ok) {
          const photosData = await photosResponse.json();
          setPhotos(photosData);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.albumSlug, params.categorySlug]);

  if (isLoading) {
    return (
      <div className="py-8 px-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!album || !category) {
    return notFound();
  }

  return (
    <div className="py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/${category.slug}`}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Назад до {category.name}
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold">{album.name}</h1>

        {album.description && (
          <p className="mt-2 text-muted-foreground max-w-3xl">
            {album.description}
          </p>
        )}

        <div className="mt-8">
          {photos.length === 0 ? (
            <p className="text-muted-foreground">
              В цьому альбомі поки немає фотографій.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="aspect-square relative overflow-hidden rounded-md border bg-muted cursor-pointer"
                  onClick={() => setSelectedPhotoIndex(index)}
                >
                  <Image
                    src={photo.thumbnailUrl}
                    alt={photo.filename}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPhotoIndex !== null && (
        <PhotoViewer
          photos={photos}
          initialIndex={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
        />
      )}
    </div>
  );
}
