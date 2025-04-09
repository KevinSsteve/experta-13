
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';

interface SalesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SalesPagination({ currentPage, totalPages, onPageChange }: SalesPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <Button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            variant="ghost"
            className="gap-1 pl-2.5"
            disabled={currentPage === 1}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
        </PaginationItem>
        
        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          
          if (
            page === 1 || 
            page === totalPages || 
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          } else if (
            page === currentPage - 2 || 
            page === currentPage + 2
          ) {
            return (
              <PaginationItem key={page}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          
          return null;
        })}
        
        <PaginationItem>
          <Button 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            variant="ghost"
            className="gap-1 pr-2.5"
            disabled={currentPage === totalPages}
          >
            <span>Next</span>
            <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
