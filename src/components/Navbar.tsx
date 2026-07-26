import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, ShoppingCart } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CartDrawer } from "@/components/CartDrawer";

export function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const onDashboard = location.pathname === "/dashboard";
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">El Saber HN</span>
        </Link>
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setCartOpen(true)}
            className="relative grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 grid place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
                style={{ height: 18, minWidth: 18 }}
              >
                {count}
              </span>
            )}
          </button>
          {user ? (
            <>
              {!onDashboard && (
                <Link to="/dashboard" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">
                  Volver al campus
                </Link>
              )}
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {user.role === "instructor_pro" ? "Instructor Pro" : user.role === "instructor" ? "Instructor" : "Estudiante"}
              </span>

              <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
                <LogOut className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </Button>
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Está segura de cerrar sesión?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se cerrará tu sesión actual y volverás a la página de inicio.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { logout(); setConfirmOpen(false); navigate({ to: "/" }); }}>
                      Sí, cerrar sesión
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Ingresar</Button></Link>
              <Link to="/login"><Button size="sm" onClick={() => localStorage.setItem("es_register_mode", "1")}>Registrarme</Button></Link>
            </>
          )}
        </nav>
      </div>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
