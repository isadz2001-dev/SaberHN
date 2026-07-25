import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GraduationCap, ChevronLeft, Crown } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  validateSearch: () => ({
    role: "student" as "student" | "instructor",
    pro: false as boolean,
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState<Role>(search.role);
  const [pro, setPro] = useState(search.pro);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !fullName || !password || !age) return setError("Completa todos los campos");
    if (fullName.length < 3 || fullName.length > 60) return setError("El nombre debe tener entre 3 y 60 caracteres");
    if (password.length < 6 || password.length > 40) return setError("La contraseña debe tener entre 6 y 40 caracteres");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Correo electrónico inválido");
    const ageN = parseInt(age, 10);
    if (isNaN(ageN) || ageN < 10 || ageN > 100) return setError("Edad inválida (10-100)");
    const finalRole: Role = role === "instructor" ? (pro ? "instructor_pro" : "instructor") : "student";
    const res = register({ email, fullName, password, age: ageN, role: finalRole });
    if (!res.ok) return setError(res.error || "Error");
    navigate({ to: "/login" });
  };

  return (
    <div className="app-shell flex flex-col">
      {/* Orange header */}
      <div className="relative px-5 pb-8 pt-12 text-white"
        style={{ background: "linear-gradient(160deg, #f97316 0%, #ea580c 100%)" }}>
        <Link to="/login" className="mb-4 inline-flex items-center gap-1 text-sm text-white/80">
          <ChevronLeft className="h-4 w-4" /> Volver
        </Link>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
            <p className="text-sm text-white/80">Únete en menos de un minuto</p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="-mt-4 flex-1 rounded-t-3xl bg-background px-6 pt-6 pb-8">
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} maxLength={60} placeholder="Ej. Juan Pérez" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={80} placeholder="tucorreo@ejemplo.com" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} maxLength={40} placeholder="Mínimo 6 caracteres" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="age">Edad</Label>
            <Input id="age" type="number" value={age} onChange={e => setAge(e.target.value)} min={10} max={100} className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Tipo de cuenta</Label>
            <RadioGroup value={role} onValueChange={(v) => setRole(v as Role)} className="grid gap-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition active:scale-[0.98] has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <RadioGroupItem value="student" id="r1" />
                <div>
                  <p className="text-sm font-semibold">Estudiante</p>
                  <p className="text-xs text-muted-foreground">Quiero aprender nuevas habilidades</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition active:scale-[0.98] has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <RadioGroupItem value="instructor" id="r2" />
                <div>
                  <p className="text-sm font-semibold">Maestro / Instructor</p>
                  <p className="text-xs text-muted-foreground">Quiero enseñar y crear cursos</p>
                </div>
              </label>
            </RadioGroup>
          </div>
          {role === "instructor" && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 p-3.5 transition active:scale-[0.98]">
              <input type="checkbox" checked={pro} onChange={e => setPro(e.target.checked)} className="mt-1 h-4 w-4 accent-orange-500" />
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <Crown className="h-4 w-4 text-primary" /> Activar Instructor Pro — L. 250/mes
                </p>
                <p className="text-xs text-muted-foreground">Cursos ilimitados, editor libre y define tus precios.</p>
              </div>
            </label>
          )}
          <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base font-semibold">
            Crear cuenta
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-primary">Ingresa aquí</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
