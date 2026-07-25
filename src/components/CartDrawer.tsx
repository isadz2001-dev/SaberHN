import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatL } from "@/lib/courses";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Trash2, ShoppingCart, CreditCard, ShieldCheck } from "lucide-react";
import { CheckoutDialog } from "@/components/CheckoutDialog";

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { items, remove, total, count } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const startCheckout = () => {
    onOpenChange(false);
    setCheckoutOpen(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          <SheetHeader className="border-b p-5 text-left">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5" />
              Mi carrito {count > 0 && <span className="text-sm font-normal text-muted-foreground">({count})</span>}
            </SheetTitle>
            <SheetDescription>Revisa tus cursos antes de pagar.</SheetDescription>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
              <p className="font-medium">Tu carrito está vacío</p>
              <p className="text-sm text-muted-foreground">Explora el catálogo y agrega cursos para empezar.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {items.map((item) => (
                  <div key={item.courseId} className="flex gap-3 rounded-lg border p-3">
                    <div
                      className="h-16 w-24 shrink-0 rounded-md bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate text-sm font-semibold">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">Por {item.instructor}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      <div className="mt-auto flex items-center justify-between pt-1">
                        <span className="text-sm font-bold text-primary">{formatL(item.price)}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => remove(item.courseId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatL(total)}</span>
                </div>
                <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" /> Pago seguro en lempiras · La plataforma retiene 20% de comisión
                </p>
                <Button className="w-full" size="lg" onClick={startCheckout}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagar {formatL(total)}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </>
  );
}
