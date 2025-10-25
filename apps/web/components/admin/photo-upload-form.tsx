'use client';

import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Album } from '@lounge/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@lounge/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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

const uploadSchema = z.object({
  photo: z.any().refine((files) => files && files.length > 0, {
    message: 'At least one photo file is required',
  }),
  albumId: z.string().optional(),
  description: z.string().optional(),
  displayOrder: z.number().min(0),
  isSlider: z.boolean(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function PhotoUploadForm({
  albums,
  onUploadComplete,
  albumId,
}: PhotoUploadFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [fileItems, setFileItems] = useState<{ id: string; file: File; previewUrl: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [overallMessage, setOverallMessage] = useState('');
  // Removed selectedAlbumId state as we rely on form state

  const form = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      albumId: albumId || '',
      description: '',
      displayOrder: 0,
      isSlider: false,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Revoke old preview URLs
    fileItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));

    const selectedFiles = event.target.files;
    setOverallMessage('');
    setUploadProgress([]);

    if (selectedFiles && selectedFiles.length > 0) {
      const newFileItems = Array.from(selectedFiles)
        .filter((file) => file.type.startsWith('image/'))
        .map((file) => ({
          id: self.crypto.randomUUID(), // Generate unique ID
          file: file,
          previewUrl: URL.createObjectURL(file),
        }));
      setFileItems(newFileItems);
    } else {
      setFileItems([]); // Clear if no files selected or selection is cancelled
    }
  };

  const handleRemoveFile = (idToRemove: string) => {
    const itemToRemove = fileItems.find((item) => item.id === idToRemove);
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
      setFileItems((prevItems) => prevItems.filter((item) => item.id !== idToRemove));
    }
  };

  // Effect for cleaning up preview URLs
  useEffect(() => {
    return () => {
      fileItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [fileItems]);

  // Effect to update form value when albumId prop changes
  useEffect(() => {
    if (albumId) {
      form.setValue('albumId', albumId);
    }
  }, [albumId, form]);

  const onSubmit = async (data: UploadFormData) => {
    if (fileItems.length === 0) {
      setOverallMessage('Please select files to upload.');
      return;
    }

    setIsUploading(true);
    setOverallMessage(`Uploading ${fileItems.length} photo(s)...`);
    const newProgress: string[] = [];

    let successfulUploads = 0;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const token = await getToken();
    console.log(
      'Clerk token fetched in PhotoUploadForm:',
      token ? `Token length: ${token.length}` : 'Token is null/undefined',
    );

    if (!token) {
      console.error('PhotoUploadForm: Halting upload due to missing token.');
      setOverallMessage('Authentication token not found. Please try logging in again.');
      setIsUploading(false);
      return;
    }

    for (let i = 0; i < fileItems.length; i++) {
      const fileItem = fileItems[i];
      if (!fileItem) continue;
      const { file } = fileItem;
      newProgress.push(`Uploading ${file.name}...`);
      setUploadProgress([...newProgress]);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('albumId', data.albumId || '');
      formData.append('description', data.description || '');
      formData.append('isSliderImage', String(data.isSlider));
      formData.append('displayOrder', String(data.displayOrder + i));

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        console.log(
          `PhotoUploadForm: Uploading ${file.name} with headers:`,
          JSON.stringify(headers),
        );

        const response = await fetch(`${apiUrl}/photos/upload`, {
          // Ensure this matches your API endpoint
          method: 'POST',
          headers: headers,
          body: formData,
        });

        if (response.ok) {
          successfulUploads++;
          newProgress[i] = `✅ ${file.name} - Uploaded successfully.`;
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Unknown server error' }));
          newProgress[i] = `❌ ${file.name} - Error: ${errorData.message || response.statusText}`;
          console.error(`Error uploading ${file.name}:`, errorData.message || response.statusText);
        }
      } catch (error: unknown) {
        newProgress[i] =
          `❌ ${file.name} - Network error: ${error instanceof Error ? error.message : 'Check connection'}`;
        console.error(`Network error during upload of ${file.name}:`, error);
      }
      setUploadProgress([...newProgress]);
    }

    setIsUploading(false);
    setOverallMessage(`Upload complete. Successful: ${successfulUploads}/${fileItems.length}.`);

    // Reset file input and fileItems state after a short delay
    setTimeout(() => {
      form.reset();
      // URLs are revoked by useEffect when fileItems changes to []
      setFileItems([]);
    }, 3000);

    if (successfulUploads > 0) {
      // Call callback after another delay to ensure messages are read
      setTimeout(() => {
        if (onUploadComplete) {
          onUploadComplete();
        } else {
          router.push('/admin/photos');
        }
      }, 3500);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
      >
        <h3 className="text-xl font-semibold mb-3 text-foreground">Upload New Photos</h3>
        <FormField
          control={form.control}
          name="photo"
          render={({ field: { onChange } }) => (
            <FormItem>
              <FormLabel>Photo File *</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    onChange(e.target.files);
                    handleFileChange(e);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 cursor-pointer"
                  disabled={isUploading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Album Selection */}
        {albumId && <p className="text-sm text-gray-700 mb-2">Album pre-selected: {albumId}</p>}
        <FormField
          control={form.control}
          name="albumId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Album *</FormLabel>
              <FormControl>
                <AlbumSelect
                  albums={albums}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Select an album"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional description for the photos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display Order */}
        <FormField
          control={form.control}
          name="displayOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Use as slider image */}
        <FormField
          control={form.control}
          name="isSlider"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm font-normal">Use as slider image</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {fileItems.length > 0 && !isUploading && (
          <p className="text-sm text-gray-600 mt-2 mb-3">
            {fileItems.length} file(s) selected. Click 'Upload' to start.
          </p>
        )}

        {fileItems.length > 0 && !isUploading && (
          <div className="mt-4 mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
            {' '}
            {/* Added mb-4 */}
            <p className="text-sm font-medium text-gray-700 mb-2">Selected image previews:</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {fileItems.map((item) => (
                <div key={item.id} className="relative group">
                  <img
                    src={item.previewUrl}
                    alt={`Preview of ${item.file.name}`}
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
                    <span className="block leading-none -mt-px">&#x2715;</span>{' '}
                    {/* Adjust vertical alignment of X if needed */}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || fileItems.length === 0}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
        >
          {isUploading ? 'Uploading...' : `Upload ${fileItems.length} photo(s)`}
        </button>

        {uploadProgress.length > 0 && (
          <div className="mt-4 space-y-1">
            {uploadProgress.map((msg, index) => (
              <p
                key={index}
                className={`text-xs ${msg.startsWith('❌') ? 'text-red-600' : 'text-green-600'}`}
              >
                {msg}
              </p>
            ))}
          </div>
        )}
        {overallMessage && (
          <p className="mt-3 text-sm font-medium text-gray-800">{overallMessage}</p>
        )}
      </form>
    </Form>
  );
}
