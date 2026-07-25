import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff, Info } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Completa todos los campos");
    const res = login(email, password);
    if (!res.ok) return setError(res.error || "Error");
    navigate({ to: "/dashboard" });
  };

  const fillDemo = () => {
    setEmail("demo@saberhn.hn");
    setPassword("demo1234");
    setError("");
  };

  return (
    <div className="app-shell flex flex-col">
      {/* Orange splash top */}
      <div className="relative flex flex-col items-center justify-center px-6 pb-10 pt-20 text-center text-white"
        style={{ background: "linear-gradient(160deg, #f97316 0%, #ea580c 100%)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)" }} />
        <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-white/20 backdrop-blur-sm">
          <GraduationCap className="h-10 w-10" />
        </div>
        <h1 className="relative mt-5 text-3xl font-bold tracking-tight">El Saber HN</h1>
        <p className="relative mt-1.5 text-sm text-white/80">Aprende con expertos locales</p>
      </div>

      {/* Login form card */}
      <div className="-mt-6 flex-1 rounded-t-3xl bg-background px-6 pt-8">
        <h2 className="text-xl font-bold text-foreground">Bienvenido de vuelta</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ingresa a tu cuenta para continuar</p>

        {/* Demo credentials hint */}
        <button
          onClick={fillDemo}
          className="mt-4 flex w-full items-start gap-2.5 rounded-2xl border border-primary/30 bg-primary/5 p-3.5 text-left transition active:scale-[0.98]"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15">
            <Info className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Usuario de prueba</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Correo: <span className="font-medium text-foreground">demo@saberhn.hn</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Contraseña: <span className="font-medium text-foreground">demo1234</span>
            </p>
          </div>
          <span className="shrink-0 self-center rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            Usar
          </span>
        </button>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              maxLength={80}
              placeholder="tucorreo@ejemplo.com"
              className="h-12 rounded-xl"
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                maxLength={40}
                placeholder="Mínimo 6 caracteres"
                className="h-12 rounded-xl pr-11"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base font-semibold">
            Ingresar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="font-semibold text-primary">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
