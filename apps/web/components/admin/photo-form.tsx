'use client';

import { useAuth } from '@clerk/nextjs';
import type { Album, Photo } from '@lounge/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import AlbumSelect from './album-select';

interface PhotoFormProps {
  photo?: Photo;
  albums: Album[];
  onSubmit?: (data: FormData) => Promise<void>;
  onCancel?: () => void;
}

export default function PhotoForm({ photo, albums, onSubmit, onCancel }: PhotoFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const id = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(photo?.thumbnailUrl || null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(photo?.albumId || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const buildPatchPayload = (formData: FormData) => {
    const description = (formData.get('description') as string) || photo?.description || '';
    const displayOrderStr = formData.get('displayOrder') as string;
    const displayOrder = displayOrderStr ? parseInt(displayOrderStr, 10) : photo?.displayOrder || 0;
    const isSliderImage = formData.has('isSliderImage') ? true : photo?.isSliderImage || false;

    const values = { description, displayOrder, isSliderImage };
    return { body: JSON.stringify(values), headers: { 'Content-Type': 'application/json' } };
  };

  const defaultSubmit = async (formData: FormData) => {
    const endpoint = photo ? `/api/photos/${photo.id}` : '/api/photos/upload';
    const method = photo ? 'PATCH' : 'POST';

    const token = await getToken();
    console.log('[PhotoForm] api:token', token ? `len:${token.length}` : 'null');

    if (!token) {
      console.error('[PhotoForm] api:no-token');
      toast.error('Authentication token not found. Please try logging in again.');
      return;
    }

    let body: string | FormData = formData;
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

    if (method === 'PATCH') {
      const patch = buildPatchPayload(formData);
      body = patch.body;
      Object.assign(headers, patch.headers);
      console.log('[PhotoForm] api:patch:payload', patch);
    }

    console.log('[PhotoForm] api:request', {
      endpoint,
      method,
      headers: { hasAuth: !!headers.Authorization, contentType: headers['Content-Type'] },
    });

    const response = await fetch(endpoint, { method, headers, body });
    console.log('[PhotoForm] api:response', { ok: response.ok, status: response.status });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[PhotoForm] api:error-response', { status: response.status, text });
      throw new Error('Failed to save photo');
    }

    router.push('/admin/photos');
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('[PhotoForm] submit:start');
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      if (selectedFile) {
        formData.set('file', selectedFile);
      }

      console.log('[PhotoForm] submit:data', {
        hasFile: !!selectedFile,
        albumId: formData.get('albumId'),
        description: formData.get('description'),
        displayOrder: formData.get('displayOrder'),
        isSliderImage: formData.get('isSliderImage'),
      });

      if (onSubmit) {
        await onSubmit(formData);
        console.log('[PhotoForm] submit:onSubmit:done');
      } else {
        await defaultSubmit(formData);
      }
    } catch (error) {
      console.error('[PhotoForm] submit:error', error);
      toast.error('Error saving photo. Please try again.');
    } finally {
      setIsSubmitting(false);
      console.log('[PhotoForm] submit:end');
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
      <h2 className="text-xl font-semibold text-foreground mb-6">
        {photo ? 'Edit Photo' : 'Upload New Photo'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        {!photo && (
          <div>
            <label htmlFor={`${id}-file`} className="block text-sm font-medium text-gray-700 mb-2">
              Photo File *
            </label>
            <input
              type="file"
              id={`${id}-file`}
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
            <span className="block text-sm font-medium text-gray-700 mb-2">Preview</span>
            <div className="w-48 h-48 border border-gray-300 rounded-lg overflow-hidden">
              <Image
                src={previewUrl}
                alt="Preview"
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Album Selection */}
        <div>
          <label htmlFor={`${id}-albumId`} className="block text-sm font-medium text-gray-700 mb-2">
            Album *
          </label>
          <AlbumSelect
            id={`${id}-albumId`}
            albums={albums}
            value={selectedAlbumId}
            onChange={setSelectedAlbumId}
            placeholder="Select an album"
          />
          <input type="hidden" name="albumId" value={selectedAlbumId} />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor={`${id}-description`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id={`${id}-description`}
            name="description"
            rows={3}
            defaultValue={photo?.description || ''}
            placeholder="Optional description for this photo"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Display Order */}
        <div>
          <label
            htmlFor={`${id}-displayOrder`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Display Order
          </label>
          <input
            type="number"
            id={`${id}-displayOrder`}
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
            id={`${id}-isSliderImage`}
            name="isSliderImage"
            defaultChecked={photo?.isSliderImage || false}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={`${id}-isSliderImage`} className="ml-2 block text-sm text-gray-700">
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
            {isSubmitting ? 'Saving...' : photo ? 'Update Photo' : 'Upload Photo'}
          </button>
        </div>
      </form>
    </div>
  );
}
