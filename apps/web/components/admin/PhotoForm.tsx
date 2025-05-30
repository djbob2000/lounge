"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Album, Photo } from "@lounge/types";

interface PhotoFormProps {
  photo?: Photo;
  albums: Album[];
  onSubmit?: (data: FormData) => Promise<void>;
  onCancel?: () => void;
}

export default function PhotoForm({
  photo,
  albums,
  onSubmit,
  onCancel,
}: PhotoFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    photo?.thumbnailUrl || null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default submission logic
        const endpoint = photo
          ? `/api/photos/${photo.id}`
          : "/api/photos/upload";

        const method = photo ? "PATCH" : "POST";

        const response = await fetch(endpoint, {
          method,
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to save photo");
        }

        router.push("/admin/photos");
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving photo:", error);
      alert("Error saving photo. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">
        {photo ? "Edit Photo" : "Upload New Photo"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        {!photo && (
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Photo File *
            </label>
            <input
              type="file"
              id="file"
              name="file"
              accept="image/*"
              required={!photo}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        )}

        {/* Preview */}
        {previewUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="w-48 h-48 border border-gray-300 rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Album Selection */}
        <div>
          <label
            htmlFor="albumId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Album *
          </label>
          <select
            id="albumId"
            name="albumId"
            required
            defaultValue={photo?.albumId || ""}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an album</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={photo?.description || ""}
            placeholder="Optional description for this photo"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Display Order */}
        <div>
          <label
            htmlFor="displayOrder"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Display Order
          </label>
          <input
            type="number"
            id="displayOrder"
            name="displayOrder"
            min="0"
            defaultValue={photo?.displayOrder || 0}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Slider Image Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isSliderImage"
            name="isSliderImage"
            defaultChecked={photo?.isSliderImage || false}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isSliderImage"
            className="ml-2 block text-sm text-gray-700"
          >
            Use as slider image
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Saving..."
              : photo
                ? "Update Photo"
                : "Upload Photo"}
          </button>
        </div>
      </form>
    </div>
  );
}
