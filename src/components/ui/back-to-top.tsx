
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle } from 'lucide-react';

interface BackToTopButtonProps {
  visible: boolean;
}

export const BackToTopButton = ({ visible }: BackToTopButtonProps) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <Button
      className="fixed bottom-20 right-4 md:bottom-4 md:right-4 rounded-full h-10 w-10 p-0 shadow-lg"
      onClick={scrollToTop}
    >
      <ArrowUpCircle className="h-6 w-6" />
    </Button>
  );
};
