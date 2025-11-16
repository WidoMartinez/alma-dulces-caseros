import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { APP_LOGO, BRAND_INFO, getLoginUrl } from "@/const";

interface NavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  cartCount: number;
  onCartClick: () => void;
  isAuthenticated: boolean;
}

export default function Navigation({
  activeSection,
  onNavigate,
  cartCount,
  onCartClick,
  isAuthenticated,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "inicio", label: "Inicio" },
    { id: "productos", label: "Productos" },
    { id: "acerca-de", label: "Acerca de" },
    { id: "testimonios", label: "Testimonios" },
    { id: "reservas", label: "Reservas" },
    { id: "contacto", label: "Contacto" },
  ];

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick("inicio")}>
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-lg">A</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-foreground">{BRAND_INFO.name}</h1>
              <p className="text-xs text-muted-foreground">{BRAND_INFO.tagline}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "text-accent"
                    : "text-foreground hover:text-accent"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-accent/10 rounded-lg transition-colors"
            >
              <ShoppingCart size={20} className="text-accent" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <a href="/profile">
                <Button variant="default" size="sm" className="hidden sm:inline-flex">
                  Mi Cuenta
                </Button>
              </a>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <a href="/register">
                  <Button variant="outline" size="sm">
                    Registrarse
                  </Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button variant="default" size="sm">
                    Ingresar
                  </Button>
                </a>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-accent/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-foreground hover:bg-accent/5"
                }`}
              >
                {item.label}
              </button>
            ))}
            {isAuthenticated ? (
              <a href="/profile" className="block">
                <Button variant="default" size="sm" className="w-full">
                  Mi Cuenta
                </Button>
              </a>
            ) : (
              <>
                <a href="/register" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    Registrarse
                  </Button>
                </a>
                <a href={getLoginUrl()} className="block">
                  <Button variant="default" size="sm" className="w-full">
                    Ingresar
                  </Button>
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
