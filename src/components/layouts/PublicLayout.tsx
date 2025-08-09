import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <nav className="container mx-auto flex items-center justify-between py-4 px-4">
          <Link to="/" className="flex items-center gap-2 hover-scale" aria-label="Ir para a página inicial">
            <img src="/logo.png" alt="Logo Experta" className="h-8 w-8" loading="eager" />
            <span className="text-lg font-bold tracking-wide">experta</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#como-funciona" className="story-link">Como funciona</a>
            <a href="#beneficios" className="story-link">Benefícios</a>
            <a href="#tecnologia" className="story-link">Tecnologia</a>
            <a href="#para-quem" className="story-link">Para quem</a>
            <a href="#equipa" className="story-link">Equipa</a>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/auth" className="hidden sm:inline-block">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button>Experimente grátis</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t border-border">
        <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-base font-semibold mb-3">Experta</h3>
            <p className="text-sm text-muted-foreground">IA de voz para gestão financeira de pequenos comerciantes.</p>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-3">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="tel:+244924000171" className="hover:underline">+244 924 000 171</a></li>
              <li><a href="https://wa.me/244924000171" target="_blank" rel="noreferrer" className="hover:underline">WhatsApp</a></li>
              <li><a href="https://instagram.com/experta.ao" target="_blank" rel="noreferrer" className="hover:underline">@experta.ao</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:underline">Política de Privacidade</a></li>
              <li><a href="#" className="hover:underline">Termos de Uso</a></li>
              <li><Link to="/auth" className="hover:underline">Download do App (PWA)</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Experta. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
