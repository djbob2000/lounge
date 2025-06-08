"use client";

import { useState, useEffect } from 'react'; // Import useEffect
import { useAuth } from "@clerk/nextjs";
// Assuming UploadPhotoRequest might be useful for type hints if not directly for FormData
// import { UploadPhotoDto } from '@lounge/types';

interface PhotoUploadFormProps {
  albumId: string;
  onUploadComplete: () => void;
}

export default function PhotoUploadForm({ albumId, onUploadComplete }: PhotoUploadFormProps) {
  const { getToken } = useAuth();
  const [fileItems, setFileItems] = useState<{ id: string; file: File; previewUrl: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [overallMessage, setOverallMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Revoke old preview URLs
    fileItems.forEach(item => URL.revokeObjectURL(item.previewUrl));

    const selectedFiles = event.target.files;
    setOverallMessage('');
    setUploadProgress([]);

    if (selectedFiles && selectedFiles.length > 0) {
      const newFileItems = Array.from(selectedFiles)
        .filter(file => file.type.startsWith('image/'))
        .map(file => ({
          id: self.crypto.randomUUID(), // Generate unique ID
          file: file,
          previewUrl: URL.createObjectURL(file)
        }));
      setFileItems(newFileItems);
    } else {
      setFileItems([]); // Clear if no files selected or selection is cancelled
    }
  };

  const handleRemoveFile = (idToRemove: string) => {
    const itemToRemove = fileItems.find(item => item.id === idToRemove);
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
      setFileItems(prevItems => prevItems.filter(item => item.id !== idToRemove));
    }
  };

  // Effect for cleaning up preview URLs
  useEffect(() => {
    return () => {
      fileItems.forEach(item => URL.revokeObjectURL(item.previewUrl));
    };
  }, [fileItems]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fileItems.length === 0) {
      setOverallMessage('Please select files to upload.');
      return;
    }

    setIsUploading(true);
    setOverallMessage(`Uploading ${fileItems.length} photo(s)...`);
    const newProgress: string[] = [];

    let successfulUploads = 0;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    const token = await getToken();
    console.log('Clerk token fetched in PhotoUploadForm:', token ? `Token length: ${token.length}` : 'Token is null/undefined');

    if (!token) {
      console.error('PhotoUploadForm: Halting upload due to missing token.');
      setOverallMessage("Authentication token not found. Please try logging in again.");
      setIsUploading(false);
      return;
    }

    for (let i = 0; i < fileItems.length; i++) {
      const { file } = fileItems[i]; // Get the file from the item
      newProgress.push(`Uploading ${file.name}...`);
      setUploadProgress([...newProgress]);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('albumId', albumId);
      // Example of adding other DTO fields if they were simple types:
      // formData.append('isSliderImage', 'false');
      // formData.append('displayOrder', String(i)); // Example: order based on selection sequence

      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
        };
        console.log(`PhotoUploadForm: Uploading ${file.name} with headers:`, JSON.stringify(headers));

        const response = await fetch(`${apiUrl}/photos/upload`, { // Ensure this matches your API endpoint
          method: 'POST',
          headers: headers,
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
    setOverallMessage(`Upload complete. Successful: ${successfulUploads}/${fileItems.length}.`);

    // Reset file input and fileItems state after a short delay
    setTimeout(() => {
        if (event.target instanceof HTMLFormElement) {
            event.target.reset();
        }
        // URLs are revoked by useEffect when fileItems changes to []
        setFileItems([]);
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
      {fileItems.length > 0 && !isUploading && (
        <p className="text-sm text-gray-600 mt-2 mb-3">{fileItems.length} file(s) selected. Click "Upload" to start.</p>
      )}

      {fileItems.length > 0 && !isUploading && (
        <div className="mt-4 mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50"> {/* Added mb-4 */}
          <p className="text-sm font-medium text-gray-700 mb-2">Selected image previews:</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {fileItems.map((item) => (
              <div key={item.id} className="relative group">
                <img
                  src={item.previewUrl}
                  alt={`Preview of ${item.file.name}`}
                  className="h-24 w-full object-cover rounded-md border border-gray-300 shadow-sm"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFile(item.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  aria-label="Remove image"
                >
                  <span className="block leading-none -mt-px">&#x2715;</span> {/* Adjust vertical alignment of X if needed */}
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
