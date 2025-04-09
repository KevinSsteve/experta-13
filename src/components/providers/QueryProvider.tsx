
import { QueryClient, QueryClientProvider as TanstackQueryProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryClientProvider({ children }: QueryProviderProps) {
  // Create a client instance that is preserved during component lifecycle
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <TanstackQueryProvider client={queryClient}>
      {children}
    </TanstackQueryProvider>
  );
}
