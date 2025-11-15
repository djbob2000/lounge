import { useCallback, useState } from 'react';

export interface OptimisticUpdateOptions<T> {
  currentData: T;
  updateFn: (data: T) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: string, revertedData: T) => void;
}

export interface OptimisticUpdateState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export function useOptimisticUpdate<T>(options: OptimisticUpdateOptions<T>) {
  const { currentData, updateFn, onSuccess, onError } = options;

  const [state, setState] = useState<OptimisticUpdateState<T>>({
    data: currentData,
    loading: false,
    error: null,
  });

  const update = useCallback(
    async (newData: Partial<T>) => {
      // Optimistically update the UI
      const optimisticData = { ...state.data, ...newData };
      const previousData = state.data;

      setState({
        data: optimisticData,
        loading: true,
        error: null,
      });

      try {
        // Make the actual API call
        const updatedData = await updateFn(optimisticData);

        setState({
          data: updatedData,
          loading: false,
          error: null,
        });

        onSuccess?.(updatedData);
      } catch (error) {
        // Revert to previous data on error
        const errorMessage = error instanceof Error ? error.message : 'Update failed';
        setState({
          data: previousData,
          loading: false,
          error: errorMessage,
        });

        onError?.(errorMessage, previousData);
      }
    },
    [state.data, updateFn, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setState({
      data: currentData,
      loading: false,
      error: null,
    });
  }, [currentData]);

  return {
    ...state,
    update,
    reset,
  };
}
