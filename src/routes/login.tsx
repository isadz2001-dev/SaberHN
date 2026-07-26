import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff, Info, Crown, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({ component: LoginPage });

const QUICK_ACCOUNTS = [
  {
    role: "instructor" as const,
    label: "Instructor",
    desc: "Crea y gestiona cursos",
    icon: Crown,
    accent: "text-slate-600",
  },
  {
    role: "student" as const,
    label: "Estudiante",
    desc: "Aprende nuevas habilidades",
    icon: User,
    accent: "text-slate-500",
  },
];

function LoginPage() {
  const { login, loginAs, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">(() => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("es_register_mode") === "1") {
      localStorage.removeItem("es_register_mode");
      return "register";
    }
    return "login";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Completa todos los campos");
    if (mode === "register") {
      if (!fullName) return setError("Ingresa tu nombre completo");
      const ageNum = parseInt(age, 10);
      if (!ageNum || ageNum < 5 || ageNum > 120) return setError("Edad inválida");
      if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
      const res = register({ email, password, fullName, age: ageNum, role });
      if (!res.ok) return setError(res.error || "Error");
      const lres = login(email, password);
      if (!lres.ok) return setError(lres.error || "Error");
      navigate({ to: "/dashboard" });
      return;
    }
    const res = login(email, password);
    if (!res.ok) return setError(res.error || "Error");
    navigate({ to: "/dashboard" });
  };

  const quickLogin = (acc: (typeof QUICK_ACCOUNTS)[number]) => {
    setError("");
    const res = loginAs(acc.role);
    if (!res.ok) return setError(res.error || "Error");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="app-shell flex flex-col">
      {/* Splash top */}
      <div className="relative flex flex-col items-center justify-center px-6 pb-10 pt-20 text-center text-white"
        style={{ background: "linear-gradient(160deg, #5a6f90 0%, #2e3a52 100%)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)" }} />
        <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-white/20 backdrop-blur-sm">
          <GraduationCap className="h-10 w-10" />
        </div>
        <h1 className="relative mt-5 text-3xl font-bold tracking-tight">El Saber HN</h1>
        <p className="relative mt-1.5 text-sm text-white/80">Aprende con expertos locales</p>
      </div>

      {/* Form card */}
      <div className="-mt-6 flex-1 rounded-t-3xl bg-background px-6 pt-8">
        <h2 className="text-xl font-bold text-foreground">
          {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login" ? "Ingresa a tu cuenta para continuar" : "Regístrate para empezar a aprender"}
        </p>

        {/* Quick login buttons */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">Entra al instante, sin contraseña:</p>
          </div>
          {QUICK_ACCOUNTS.map(acc => {
            const Icon = acc.icon;
            return (
              <button
                key={acc.role}
                onClick={() => quickLogin(acc)}
                className="flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3.5 text-left transition active:scale-[0.98]"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15">
                  <Icon className={`h-5 w-5 ${acc.accent}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{acc.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{acc.desc}</p>
                </div>
                <span className="shrink-0 self-center rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  Entrar
                </span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">
            {mode === "login" ? "o ingresa manualmente" : "o regístrate aquí"}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
              {error}
            </div>
          )}
          {mode === "register" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  maxLength={60}
                  placeholder="Tu nombre"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  min={5}
                  max={120}
                  placeholder="Ej. 25"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de cuenta</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${role === "student" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
                  >
                    <User className="h-4 w-4" /> Estudiante
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("instructor")}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${role === "instructor" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
                  >
                    <Crown className="h-4 w-4" /> Instructor
                  </button>
                </div>
              </div>
            </>
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
                autoComplete={mode === "login" ? "current-password" : "new-password"}
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
            {mode === "login" ? "Ingresar" : "Crear cuenta"}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button onClick={() => { setMode("register"); setError(""); }} className="font-semibold text-primary">
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button onClick={() => { setMode("login"); setError(""); }} className="font-semibold text-primary">
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
