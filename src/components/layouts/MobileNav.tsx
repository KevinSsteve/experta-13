import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, Store, ShoppingBag, Package, Receipt, History, BarChart } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { buttonVariants } from "@/components/ui/button"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <Link to="/" className="flex items-center gap-2 py-4">
          <Store className="h-6 w-6" />
          <h1 className="text-lg font-semibold">BizPOS</h1>
        </Link>
        <nav className="grid gap-2 py-4">
          <Link
            to="/dashboard"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'justify-start'
            )}
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/products"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'justify-start'
            )}
            onClick={() => setOpen(false)}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Produtos
          </Link>
          <Link
            to="/inventory"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'justify-start'
            )}
            onClick={() => setOpen(false)}
          >
            <Package className="mr-2 h-4 w-4" />
            Estoque
          </Link>
          <Link
            to="/checkout"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'justify-start'
            )}
            onClick={() => setOpen(false)}
          >
            <Receipt className="mr-2 h-4 w-4" />
            PDV
          </Link>
          <Link
            to="/sales-history"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'justify-start'
            )}
            onClick={() => setOpen(false)}
          >
            <History className="mr-2 h-4 w-4" />
            Histórico
          </Link>
          <Link
            to="/sales-reports"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'justify-start'
            )}
            onClick={() => setOpen(false)}
          >
            <BarChart className="mr-2 h-4 w-4" />
            Relatórios
          </Link>
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                logout();
                setOpen(false);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          ) : (
            <Link
              to="/auth"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'justify-start'
              )}
              onClick={() => setOpen(false)}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
