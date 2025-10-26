'use client';

import { useAuth } from '@clerk/nextjs';
import type { Album } from '@lounge/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@lounge/ui';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Suspense, use, useActionState, useEffect, useId, useOptimistic, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AlbumSelect from './album-select';

interface PhotoUploadFormProps {
  albums: Album[];
  onUploadComplete?: () => void;
  albumId?: string;
}

interface FileItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface FormState {
  success: boolean;
  error: string | null;
  progress: string[];
  message: string;
}

// Submit Button component using useFormStatus
function SubmitButton({ children, fileCount }: { children: React.ReactNode; fileCount: number }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || fileCount === 0}
      className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
    >
      {pending ? 'Uploading...' : `Upload ${fileCount} photo(s)`}
    </button>
  );
}

export default function PhotoUploadForm({
  albums,
  onUploadComplete,
  albumId,
}: PhotoUploadFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const baseId = useId();

  // Optimistic state for immediate feedback
  const [optimisticFiles, setOptimisticFiles] = useOptimistic<FileItem[]>([]);
  const [optimisticFormData, setOptimisticFormData] = useOptimistic({
    albumId: albumId || '',
    description: '',
    displayOrder: 0,
    isSlider: false,
  });

  // Regular state for server-side updates
  const [files, setFiles] = useState<FileItem[]>([]);
  const [formData, setFormData] = useState({
    albumId: albumId || '',
    description: '',
    displayOrder: 0,
    isSlider: false,
  });

  // Synchronize optimistic updates with actual state
  useEffect(() => {
    setFiles(optimisticFiles);
  }, [optimisticFiles]);

  useEffect(() => {
    setFormData(optimisticFormData);
  }, [optimisticFormData]);

  // Upload action function
  const uploadAction = async (prevState: FormState, formDataObj: FormData): Promise<FormState> => {
    try {
      const files = formDataObj.get('photo');
      if (!files || !(files instanceof FileList) || files.length === 0) {
        return {
          success: false,
          error: 'Please select files to upload',
          progress: [],
          message: 'Please select files to upload',
        };
      }

      const albumId = (formDataObj.get('albumId') as string) || '';
      const description = (formDataObj.get('description') as string) || '';
      const displayOrder = parseInt((formDataObj.get('displayOrder') as string) || '0', 10);
      const isSlider = formDataObj.get('isSlider') === 'on';

      const progress: string[] = [];
      let successfulUploads = 0;

      const token = await getToken();
      if (!token) {
        return {
          success: false,
          error: 'Authentication token not found. Please try logging in again.',
          progress: [],
          message: 'Authentication error. Please try logging in again.',
        };
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file || !file.type.startsWith('image/')) {
          progress[i] = `❌ ${file?.name || 'Unknown file'} - Not an image file`;
          continue;
        }

        progress[i] = `Uploading ${file.name}...`;

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('albumId', albumId);
        uploadFormData.append('description', description);
        uploadFormData.append('isSliderImage', String(isSlider));
        uploadFormData.append('displayOrder', String(displayOrder + i));

        try {
          const response = await fetch(`${apiUrl}/photos/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: uploadFormData,
          });

          if (response.ok) {
            progress[i] = `✅ ${file.name} - Uploaded successfully.`;
            successfulUploads++;
          } else {
            const errorData = await response
              .json()
              .catch(() => ({ message: 'Unknown server error' }));
            progress[i] = `❌ ${file.name} - Error: ${errorData.message || response.statusText}`;
          }
        } catch (error: unknown) {
          progress[i] =
            `❌ ${file.name} - Network error: ${error instanceof Error ? error.message : 'Check connection'}`;
        }
      }

      // Clear files after successful upload
      if (successfulUploads > 0) {
        setOptimisticFiles([]);
        setTimeout(() => {
          if (onUploadComplete) {
            onUploadComplete();
          } else {
            router.push('/admin/photos');
          }
        }, 3500);
      }

      return {
        success: successfulUploads > 0,
        error: successfulUploads === 0 ? 'No files uploaded successfully' : null,
        progress,
        message: `Upload complete. Successful: ${successfulUploads}/${files.length}.`,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        progress: [],
        message: 'Upload failed. Please try again.',
      };
    }
  };

  const [state, action] = useActionState(uploadAction, {
    success: false,
    error: null,
    progress: [],
    message: '',
  });

  // Optimistic file handling
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Revoke old preview URLs
    files.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
    });

    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFileItems = Array.from(selectedFiles)
        .filter((file) => file.type.startsWith('image/'))
        .map((file) => ({
          id: self.crypto.randomUUID(),
          file: file,
          previewUrl: URL.createObjectURL(file),
        }));
      setOptimisticFiles(newFileItems);
    } else {
      setOptimisticFiles([]);
    }
  };

  const handleRemoveFile = (idToRemove: string) => {
    const itemToRemove = files.find((item) => item.id === idToRemove);
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
      setOptimisticFiles((prevItems) => prevItems.filter((item) => item.id !== idToRemove));
    }
  };

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      files.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [files]);

  // Update form data optimistically
  const updateFormField = (field: keyof typeof formData, value: any) => {
    setOptimisticFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form action={action} className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-3 text-foreground">Upload New Photos</h3>

      {/* Photo File Input */}
      <FormItem>
        <FormLabel htmlFor={`${baseId}-photo`}>Photo File *</FormLabel>
        <FormControl>
          <Input
            id={`${baseId}-photo`}
            name="photo"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 cursor-pointer"
          />
        </FormControl>
        <FormMessage />
      </FormItem>

      {/* Album Selection */}
      {albumId && <p className="text-sm text-gray-700 mb-2">Album pre-selected: {albumId}</p>}
      <FormItem>
        <FormLabel htmlFor={`${baseId}-albumId`}>Album *</FormLabel>
        <FormControl>
          <AlbumSelect
            id={`${baseId}-albumId`}
            albums={albums}
            value={optimisticFormData.albumId}
            onChange={(value) => updateFormField('albumId', value)}
            placeholder="Select an album"
          />
        </FormControl>
        <FormMessage />
      </FormItem>

      {/* Description */}
      <FormItem>
        <FormLabel htmlFor={`${baseId}-description`}>Description</FormLabel>
        <FormControl>
          <Textarea
            id={`${baseId}-description`}
            name="description"
            placeholder="Optional description for the photos"
            value={optimisticFormData.description}
            onChange={(e) => updateFormField('description', e.target.value)}
          />
        </FormControl>
        <FormMessage />
      </FormItem>

      {/* Display Order */}
      <FormItem>
        <FormLabel htmlFor={`${baseId}-displayOrder`}>Display Order</FormLabel>
        <FormControl>
          <Input
            id={`${baseId}-displayOrder`}
            name="displayOrder"
            type="number"
            min="0"
            value={optimisticFormData.displayOrder}
            onChange={(e) => updateFormField('displayOrder', parseInt(e.target.value, 10) || 0)}
          />
        </FormControl>
        <FormMessage />
      </FormItem>

      {/* Use as slider image */}
      <FormItem>
        <div className="flex items-center space-x-2">
          <FormControl>
            <Checkbox
              id={`${baseId}-isSlider`}
              name="isSlider"
              checked={optimisticFormData.isSlider}
              onCheckedChange={(value) => updateFormField('isSlider', value)}
            />
          </FormControl>
          <FormLabel htmlFor={`${baseId}-isSlider`} className="text-sm font-normal">
            Use as slider image
          </FormLabel>
        </div>
        <FormMessage />
      </FormItem>

      {/* File Status and Previews */}
      {optimisticFiles.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mt-2 mb-3">
            {optimisticFiles.length} file(s) selected. Click 'Upload' to start.
          </p>

          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">Selected image previews:</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {optimisticFiles.map((item) => (
                <div key={item.id} className="relative group">
                  <Image
                    src={item.previewUrl}
                    alt={`Preview of ${item.file.name}`}
                    width={200}
                    height={128}
                    className="h-24 w-full object-cover rounded-md border border-gray-300 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(item.id)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    aria-label="Remove image"
                  >
                    <span className="block leading-none -mt-px">&#x2715;</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button using useFormStatus */}
      <SubmitButton fileCount={optimisticFiles.length}>Upload</SubmitButton>

      {/* Upload Progress */}
      {state.progress.length > 0 && (
        <div className="mt-4 space-y-1">
          {state.progress.map((msg) => (
            <p
              key={msg}
              className={`text-xs ${msg.startsWith('❌') ? 'text-red-600' : 'text-green-600'}`}
            >
              {msg}
            </p>
          ))}
        </div>
      )}

      {/* Overall Message */}
      {state.message && <p className="mt-3 text-sm font-medium text-gray-800">{state.message}</p>}

      {/* Error Display */}
      {state.error && <p className="mt-3 text-sm font-medium text-red-600">{state.error}</p>}
    </form>
  );
}
