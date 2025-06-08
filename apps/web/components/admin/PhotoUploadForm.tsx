"use client";

import { useState } from 'react';
import { useAuth } from "@clerk/nextjs";
// Assuming UploadPhotoRequest might be useful for type hints if not directly for FormData
// import { UploadPhotoDto } from '@lounge/types';

interface PhotoUploadFormProps {
  albumId: string;
  onUploadComplete: () => void;
}

export default function PhotoUploadForm({ albumId, onUploadComplete }: PhotoUploadFormProps) {
  const { getToken } = useAuth();
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]); // To show individual file status
  const [overallMessage, setOverallMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files);
    setOverallMessage('');
    setUploadProgress([]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!files || files.length === 0) {
      setOverallMessage('Please select files to upload.');
      return;
    }

    setIsUploading(true);
    setOverallMessage(`Uploading ${files.length} photo(s)...`);
    const newProgress: string[] = [];

    let successfulUploads = 0;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'; // Ensure /api if needed

    const token = await getToken();
    if (!token) {
      setOverallMessage("Authentication token not found. Please try logging in again.");
      setIsUploading(false);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newProgress.push(`Uploading ${file.name}...`);
      setUploadProgress([...newProgress]);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('albumId', albumId);
      // Example of adding other DTO fields if they were simple types:
      // formData.append('isSliderImage', 'false');
      // formData.append('displayOrder', String(i)); // Example: order based on selection sequence

      try {
        const response = await fetch(`${apiUrl}/photos/upload`, { // Ensure this matches your API endpoint
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          successfulUploads++;
          newProgress[i] = `✅ ${file.name} - Uploaded successfully.`;
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
          newProgress[i] = `❌ ${file.name} - Error: ${errorData.message || response.statusText}`;
          console.error(`Error uploading ${file.name}:`, errorData.message || response.statusText);
        }
      } catch (error: any) {
        newProgress[i] = `❌ ${file.name} - Network error: ${error.message || 'Check connection'}`;
        console.error(`Network error during upload of ${file.name}:`, error);
      }
      setUploadProgress([...newProgress]);
    }

    setIsUploading(false);
    setOverallMessage(`Upload complete. Successful: ${successfulUploads}/${files.length}.`);

    // Reset file input after a short delay to allow user to see individual statuses
    setTimeout(() => {
        if (event.target instanceof HTMLFormElement) {
            event.target.reset(); // Resets the form, clearing the file input
        }
        setFiles(null);
    }, 3000);


    if (successfulUploads > 0) {
      // Call callback after another delay to ensure messages are read
      setTimeout(() => {
        onUploadComplete();
      }, 3500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-3 text-gray-700">Upload New Photos</h3>
      <div className="mb-4">
        <label htmlFor="fileUpload" className="sr-only">Select files</label>
        <input
          id="fileUpload"
          type="file"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 cursor-pointer"
          disabled={isUploading}
        />
      </div>
      {files && files.length > 0 && !isUploading && (
        <p className="text-sm text-gray-600 mt-2 mb-3">{files.length} file(s) selected. Click "Upload" to start.</p>
      )}
      <button
        type="submit"
        disabled={isUploading || !files || files.length === 0}
        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
      >
        {isUploading ? 'Uploading...' : `Upload ${files ? files.length : ''} photo(s)`}
      </button>

      {uploadProgress.length > 0 && (
        <div className="mt-4 space-y-1">
          {uploadProgress.map((msg, index) => (
            <p key={index} className={`text-xs ${msg.startsWith('❌') ? 'text-red-600' : 'text-green-600'}`}>
              {msg}
            </p>
          ))}
        </div>
      )}
      {overallMessage && <p className="mt-3 text-sm font-medium text-gray-800">{overallMessage}</p>}
    </form>
  );
}
