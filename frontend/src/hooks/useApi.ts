import { useState, useCallback } from 'react';
import { handleAPIError } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { toast } = useToast();

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: string) => void;
      showSuccessToast?: boolean;
      showErrorToast?: boolean;
      successMessage?: string;
    }
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });

      if (options?.showSuccessToast && options?.successMessage) {
        toast({
          title: 'Success',
          description: options.successMessage,
        });
      }

      options?.onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));

      if (options?.showErrorToast !== false) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }

      options?.onError?.(errorMessage);
      throw error;
    }
  }, [toast]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for polling training status
export function useTrainingPolling() {
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const startPolling = useCallback((jobId: string, onUpdate: (job: any) => void, onComplete: (job: any) => void) => {
    setPollingJobId(jobId);
    
    const poll = async () => {
      try {
        const { apiService } = await import('@/services/api');
        const job = await apiService.getTrainingStatus(jobId);
        onUpdate(job);
        
        if (job.status === 'finished' || job.status === 'failed') {
          stopPolling();
          onComplete(job);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(poll, 2000);
    setPollingInterval(interval);
    
    // Initial poll
    poll();
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setPollingJobId(null);
  }, [pollingInterval]);

  return {
    isPolling: pollingJobId !== null,
    pollingJobId,
    startPolling,
    stopPolling,
  };
}