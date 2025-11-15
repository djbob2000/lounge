import { useCallback, useState } from 'react';

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  multiple?: boolean;
  onUpload?: (files: File[]) => Promise<void>;
  onError?: (error: string) => void;
}

export interface FileUploadState {
  files: File[];
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    multiple = false,
    onUpload,
    onError,
  } = options;

  const [state, setState] = useState<FileUploadState>({
    files: [],
    uploading: false,
    progress: 0,
    error: null,
  });

  const validateFiles = useCallback(
    (files: File[]): string | null => {
      for (const file of files) {
        if (file.size > maxSize) {
          return `File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`;
        }

        if (!acceptedTypes.includes(file.type)) {
          return `File ${file.name} has invalid type. Allowed types: ${acceptedTypes.join(', ')}`;
        }
      }
      return null;
    },
    [maxSize, acceptedTypes],
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);

      if (!multiple && selectedFiles.length > 1) {
        setState((prev) => ({ ...prev, error: 'Only one file can be selected' }));
        return;
      }

      const validationError = validateFiles(selectedFiles);
      if (validationError) {
        setState((prev) => ({ ...prev, error: validationError }));
        onError?.(validationError);
        return;
      }

      setState((prev) => ({
        ...prev,
        files: selectedFiles,
        error: null,
        progress: 0,
      }));
    },
    [multiple, validateFiles, onError],
  );

  const uploadFiles = useCallback(async () => {
    if (state.files.length === 0) {
      setState((prev) => ({ ...prev, error: 'No files selected' }));
      return;
    }

    setState((prev) => ({ ...prev, uploading: true, error: null }));

    try {
      if (onUpload) {
        await onUpload(state.files);
      }

      setState((prev) => ({
        ...prev,
        uploading: false,
        progress: 100,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState((prev) => ({
        ...prev,
        uploading: false,
        error: errorMessage,
      }));
      onError?.(errorMessage);
    }
  }, [state.files, onUpload, onError]);

  const clearFiles = useCallback(() => {
    setState({
      files: [],
      uploading: false,
      progress: 0,
      error: null,
    });
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, progress }));
  }, []);

  return {
    ...state,
    handleFileSelect,
    uploadFiles,
    clearFiles,
    setProgress,
  };
}
