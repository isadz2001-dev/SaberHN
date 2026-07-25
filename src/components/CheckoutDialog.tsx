import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatL } from "@/lib/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, Lock, CheckCircle2, Landmark, ArrowRight, ShieldCheck } from "lucide-react";

type Step = "method" | "card" | "transfer" | "processing" | "done";

export function CheckoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { items, total, clear } = useCart();
  const [step, setStep] = useState<Step>("method");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const commission = Math.round(total * 0.2);
  const instructorPayout = total - commission;

  const reset = () => {
    setStep("method");
    setCardNumber("");
    setCardName("");
    setCardExp("");
    setCardCvc("");
  };

  const close = () => {
    onOpenChange(false);
    if (step === "done") {
      clear();
      reset();
    }
  };

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExp = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const payWithCard = () => {
    setStep("processing");
    setTimeout(() => setStep("done"), 2200);
  };

  const payWithTransfer = () => {
    setStep("processing");
    setTimeout(() => setStep("done"), 2200);
  };

  const canPayCard =
    cardNumber.replace(/\s/g, "").length >= 15 &&
    cardName.trim().length >= 3 &&
    cardExp.length === 5 &&
    cardCvc.length >= 3;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) close();
        else onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {step === "done" ? "¡Pago completado!" : "Finalizar compra"}
          </DialogTitle>
          <DialogDescription>
            {step === "done"
              ? "Tu inscripción a los cursos fue procesada exitosamente."
              : `${items.length} curso(s) · Total ${formatL(total)}`}
          </DialogDescription>
        </DialogHeader>

        {step === "method" && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="mb-3 text-sm font-semibold">Resumen del pedido</p>
              <div className="space-y-2">
                {items.map((i) => (
                  <div key={i.courseId} className="flex items-center justify-between text-sm">
                    <span className="truncate pr-2">{i.title}</span>
                    <span className="font-medium">{formatL(i.price)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t pt-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatL(total)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Comisión SaberHN (20%)</span>
                  <span>−{formatL(commission)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pago a instructores (80%)</span>
                  <span>{formatL(instructorPayout)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm font-bold">
                  <span>Total a pagar</span>
                  <span className="text-primary">{formatL(total)}</span>
                </div>
              </div>
            </div>

            <p className="text-sm font-semibold">Elige tu método de pago</p>
            <button
              onClick={() => setStep("card")}
              className="flex w-full items-center gap-3 rounded-lg border p-4 text-left transition hover:border-primary hover:bg-accent/50"
            >
              <CreditCard className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Tarjeta de crédito/débito</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setStep("transfer")}
              className="flex w-full items-center gap-3 rounded-lg border p-4 text-left transition hover:border-primary hover:bg-accent/50"
            >
              <Landmark className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Transferencia bancaria local</p>
                <p className="text-xs text-muted-foreground">BAC, FICOHSA, Banpais</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {step === "card" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="card-number">Número de tarjeta</Label>
              <Input
                id="card-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="card-name">Nombre en la tarjeta</Label>
              <Input
                id="card-name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Como aparece en la tarjeta"
                maxLength={60}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="card-exp">Vencimiento</Label>
                <Input
                  id="card-exp"
                  value={cardExp}
                  onChange={(e) => setCardExp(formatExp(e.target.value))}
                  placeholder="MM/AA"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="card-cvc">CVC</Label>
                <Input
                  id="card-cvc"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  inputMode="numeric"
                />
              </div>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Desglose colaborativo de venta
              </p>
              <p className="mt-1">
                Pagas <strong>{formatL(total)}</strong> · SaberHN retiene <strong>{formatL(commission)}</strong> (20%) ·
                El instructor recibe <strong>{formatL(instructorPayout)}</strong> (80%)
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setStep("method")}>
                Volver
              </Button>
              <Button onClick={payWithCard} disabled={!canPayCard}>
                <Lock className="mr-1.5 h-3.5 w-3.5" /> Pagar {formatL(total)}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "transfer" && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-semibold">Datos para transferencia</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Banco</span>
                  <span className="font-medium">BAC Credomatic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cuenta</span>
                  <span className="font-medium">0123-4567-8901-2345</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Titular</span>
                  <span className="font-medium">SaberHN S.A.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto</span>
                  <span className="font-bold text-primary">{formatL(total)}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Envía el comprobante de transferencia a <strong>pago@saberhn.hn</strong> con tu correo de cuenta. Tu
              inscripción se confirmará en menos de 24 horas.
            </p>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setStep("method")}>
                Volver
              </Button>
              <Button onClick={payWithTransfer}>Ya transferí — Confirmar</Button>
            </DialogFooter>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="text-sm font-medium">Procesando tu pago…</p>
            <p className="text-xs text-muted-foreground">No cierres esta ventana.</p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-semibold">¡Inscripción confirmada!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ya puedes acceder a tus cursos desde "Mis aprendizajes".
              </p>
            </div>
            <div className="w-full rounded-lg border bg-muted/40 p-3 text-left text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Comprobante de venta colaborativa</p>
              <p className="mt-1">
                Total pagado: <strong>{formatL(total)}</strong> · Comisión SaberHN (20%):{" "}
                <strong>{formatL(commission)}</strong> · Instructores reciben (80%):{" "}
                <strong>{formatL(instructorPayout)}</strong>
              </p>
            </div>
            <Button onClick={close} className="w-full">
              Ir a mis cursos
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
