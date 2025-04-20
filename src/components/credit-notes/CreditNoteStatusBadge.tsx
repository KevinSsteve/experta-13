
import { Badge } from "@/components/ui/badge";

interface CreditNoteStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
}

export function CreditNoteStatusBadge({ status }: CreditNoteStatusBadgeProps) {
  if (status === 'pending') {
    return (
      <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-600">
        Pendente
      </Badge>
    );
  }
  
  if (status === 'approved') {
    return (
      <Badge variant="outline" className="border-green-300 bg-green-50 text-green-600">
        Aprovada
      </Badge>
    );
  }
  
  if (status === 'rejected') {
    return (
      <Badge variant="outline" className="border-red-300 bg-red-50 text-red-600">
        Rejeitada
      </Badge>
    );
  }
  
  return null;
}
