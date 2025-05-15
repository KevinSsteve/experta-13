
// Custom toast hook with proper types
import { Toast, ToastActionElement } from '@/components/ui/toast';
import { useToast as useToastOriginal } from '@/components/ui/toast';

// Re-export with proper types
export const useToast = useToastOriginal;

export type ToastProps = Toast & {
  title?: string;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive' | 'success';
};

// Helper function to show toasts easily
export const toast = (props: ToastProps) => {
  const { toast } = useToastOriginal();
  return toast(props);
};
