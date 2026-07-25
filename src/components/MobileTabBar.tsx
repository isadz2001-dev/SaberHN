import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { BookOpen, GraduationCap, UserCircle2, Sparkles, ShoppingCart, LogOut, Home, Crown, LayoutGrid } from "lucide-react";
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

export type TabKey =
  | "explore" | "learning" | "teach" | "plans" | "profile"
  | "blog" | "faq" | "stories";

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  isInstructor: boolean;
}

export function MobileTabBar({ active, onChange, isInstructor }: Props) {
  const { logout } = useAuth();
  const { count } = useCart();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const tabs: { key: TabKey; label: string; icon: typeof BookOpen; show: boolean }[] = [
    { key: "explore", label: "Explorar", icon: BookOpen, show: true },
    { key: "learning", label: "Mis cursos", icon: GraduationCap, show: true },
    { key: "teach", label: "Enseñar", icon: Sparkles, show: isInstructor },
    { key: "plans", label: "Planes", icon: Crown, show: isInstructor },
    { key: "profile", label: "Perfil", icon: UserCircle2, show: true },
  ];

  const visibleTabs = tabs.filter(t => t.show);

  const moreItems: { key: TabKey; label: string; icon: typeof BookOpen }[] = [
    { key: "blog", label: "Blog", icon: BookOpen },
    { key: "faq", label: "Preguntas frecuentes", icon: LayoutGrid },
    { key: "stories", label: "Historias reales", icon: GraduationCap },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t bg-card/95 backdrop-blur-lg pb-safe">
        <div className="flex items-stretch justify-around px-1 py-1.5">
          {visibleTabs.map(tab => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 transition active:scale-95"
              >
                <div className={`relative grid h-7 w-7 place-items-center rounded-full transition ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  <tab.icon style={{ width: 18, height: 18 }} />
                </div>
                <span className={`text-[10px] font-medium leading-none ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
          {/* Más button — opens sheet with Blog, FAQ, Historias */}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 transition active:scale-95"
          >
            <div className={`relative grid h-7 w-7 place-items-center rounded-full transition ${moreOpen ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <LayoutGrid style={{ width: 18, height: 18 }} />
            </div>
            <span className="text-[10px] font-medium leading-none text-muted-foreground">Más</span>
          </button>
          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 transition active:scale-95"
          >
            <div className="relative grid h-7 w-7 place-items-center rounded-full text-muted-foreground">
              <ShoppingCart style={{ width: 18, height: 18 }} />
              {count > 0 && (
                <span
                  className="absolute -right-1 -top-1 grid place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
                  style={{ height: 15, minWidth: 15, padding: "0 3px" }}
                >
                  {count}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium leading-none text-muted-foreground">Carrito</span>
          </button>
          {/* Logout button */}
          <button
            onClick={() => setConfirmOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 transition active:scale-95"
          >
            <div className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground">
              <LogOut style={{ width: 18, height: 18 }} />
            </div>
            <span className="text-[10px] font-medium leading-none text-muted-foreground">Salir</span>
          </button>
        </div>
      </nav>

      {/* "Más" bottom sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-[480px] rounded-t-3xl bg-card p-5 pb-safe animate-in slide-in-from-bottom"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
            <h3 className="mb-3 text-base font-bold">Más secciones</h3>
            <div className="grid gap-2">
              {moreItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => { onChange(item.key); setMoreOpen(false); }}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 transition active:scale-[0.98] ${active === item.key ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <item.icon style={{ width: 20, height: 20 }} />
                  </div>
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="mx-4 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Volverás a la pantalla de inicio de sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { logout(); setConfirmOpen(false); window.location.href = "/login"; }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* Top app bar for mobile — compact, orange accent */
export function MobileTopBar({ title, subtitle, onHome }: { title: string; subtitle?: string; onHome?: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-primary px-5 pb-3 pt-12 text-white pt-safe"
      style={{ background: "linear-gradient(160deg, #f97316 0%, #ea580c 100%)" }}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">{title}</h1>
          {subtitle && <p className="truncate text-xs text-white/80">{subtitle}</p>}
        </div>
        {onHome && (
          <button onClick={onHome} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20">
            <Home style={{ width: 18, height: 18 }} />
          </button>
        )}
      </div>
    </header>
  );
}
