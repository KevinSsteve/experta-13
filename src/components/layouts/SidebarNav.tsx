import {
  BarChart,
  History,
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { buttonVariants } from '@/components/ui/button';

export function SidebarNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="h-screen hidden md:block border-r w-[240px] p-4">
      <nav className="space-y-2 flex flex-col h-full">
        <Link
          to="/dashboard"
          className={cn(
            buttonVariants({ variant: isActive('/dashboard') ? 'default' : 'outline' }),
            'justify-start'
          )}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
        <Link
          to="/products"
          className={cn(
            buttonVariants({ variant: isActive('/products') ? 'default' : 'outline' }),
            'justify-start'
          )}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Produtos
        </Link>
        <Link
          to="/inventory"
          className={cn(
            buttonVariants({ variant: isActive('/inventory') ? 'default' : 'outline' }),
            'justify-start'
          )}
        >
          <Package className="mr-2 h-4 w-4" />
          Estoque
        </Link>
        <Link
          to="/checkout"
          className={cn(
            buttonVariants({ variant: isActive('/checkout') ? 'default' : 'outline' }),
            'justify-start'
          )}
        >
          <Receipt className="mr-2 h-4 w-4" />
          PDV
        </Link>
        <Link
          to="/sales-history"
          className={cn(
            buttonVariants({ variant: isActive('/sales-history') ? 'default' : 'outline' }),
            'justify-start'
          )}
        >
          <History className="mr-2 h-4 w-4" />
          Histórico
        </Link>
        <Link
          to="/sales-reports"
          className={cn(
            buttonVariants({ variant: isActive('/sales-reports') ? 'default' : 'outline' }),
            'justify-start'
          )}
        >
          <BarChart className="mr-2 h-4 w-4" />
          Relatórios
        </Link>
        <div className="mt-auto">
          {user ? (
            <Link
              to="/profile"
              className={cn(
                buttonVariants({ variant: isActive('/profile') ? 'default' : 'outline' }),
                'justify-start'
              )}
            >
              <span className="mr-2 h-4 w-4">👤</span>
              Profile
            </Link>
          ) : (
            <Link
              to="/auth"
              className={cn(
                buttonVariants({ variant: isActive('/auth') ? 'default' : 'outline' }),
                'justify-start'
              )}
            >
              <span className="mr-2 h-4 w-4">🔑</span>
              Login
            </Link>
          )}
        </div>
      </nav>
    </aside>
  );
}
