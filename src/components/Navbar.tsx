import { useState } from "react";
import { Search, Menu, X, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Movies", path: "/movies" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-blur bg-background/60 border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="font-display text-xl sm:text-2xl md:text-2xl tracking-tight">
              <span className="text-foreground">Codez</span>
              <span className="text-primary">Show</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-secondary/50 rounded-full px-2 py-1 border border-border/30">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {searchOpen ? (
              <input
                autoFocus
                placeholder="Search movies..."
                className="bg-secondary border border-border rounded-full px-3 py-1.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary w-32 sm:w-40 md:w-48 transition-all"
                onBlur={() => setSearchOpen(false)}
                onKeyDown={(e) => { if (e.key === "Enter") { navigate(`/movies?q=${e.currentTarget.value}`); setSearchOpen(false); } }}
              />
            ) : (
              <button onClick={() => setSearchOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors p-1.5">
                <Search size={18} />
              </button>
            )}

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="rounded-full gap-1 border-primary/50 text-primary hover:bg-primary/10 h-9 px-3 text-xs sm:text-sm">
                      <ShieldCheck size={14} /> Admin
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="rounded-full gap-1 h-9 px-3 text-xs sm:text-sm">
                    <LayoutDashboard size={14} /> Dashboard
                  </Button>
                </Link>
                <button onClick={handleSignOut} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-3 text-xs sm:text-sm hidden sm:flex">
                  Login
                </Button>
              </Link>
            )}

            <button className="md:hidden text-muted-foreground hover:text-foreground p-1.5" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 pb-4 pt-2 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.path} onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors">Admin Dashboard</Link>}
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">My Dashboard</Link>
              <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">Sign Out</button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMenuOpen(false)}>
              <Button variant="default" size="sm" className="w-full mt-2 rounded-full bg-primary text-primary-foreground h-10 text-sm">Login</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

