import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "student" | "instructor" | "instructor_pro";

export interface User {
  email: string;
  fullName: string;
  age: number;
  role: Role;
}

interface StoredUser extends User {
  password: string;
}

interface AuthState {
  user: User | null;
  register: (data: StoredUser) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  upgradeToPro: () => void;
  downgradeToNormal: () => void;
  updateProfile: (patch: { fullName?: string; age?: number; password?: string }) => { ok: boolean; error?: string };
}

const AuthCtx = createContext<AuthState | null>(null);
const USERS_KEY = "es_users";
const SESSION_KEY = "es_session";
const DEMO_SEEDED_KEY = "es_demo_seeded";

const DEMO_USER: StoredUser = {
  email: "demo@saberhn.hn",
  fullName: "Usuario Demo",
  age: 25,
  role: "student",
  password: "demo1234",
};

function readUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
function writeUsers(u: StoredUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

function seedDemoUser() {
  if (localStorage.getItem(DEMO_SEEDED_KEY)) return;
  const users = readUsers();
  if (!users.some(u => u.email.toLowerCase() === DEMO_USER.email.toLowerCase())) {
    users.push(DEMO_USER);
    writeUsers(users);
  }
  localStorage.setItem(DEMO_SEEDED_KEY, "1");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    seedDemoUser();
    const s = localStorage.getItem(SESSION_KEY);
    if (s) {
      const found = readUsers().find(u => u.email === s);
      if (found) {
        const { password: _p, ...rest } = found;
        setUser(rest);
      }
    }
  }, []);

  const value: AuthState = {
    user,
    register: (data) => {
      const users = readUsers();
      if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { ok: false, error: "Ya existe una cuenta con ese correo" };
      }
      users.push(data);
      writeUsers(users);
      return { ok: true };
    },
    login: (email, password) => {
      const users = readUsers();
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) return { ok: false, error: "No tiene cuenta o ingresó el nombre/contraseña incorrecto" };
      const { password: _p, ...rest } = found;
      setUser(rest);
      localStorage.setItem(SESSION_KEY, found.email);
      return { ok: true };
    },
    logout: () => {
      setUser(null);
      localStorage.removeItem(SESSION_KEY);
    },
    upgradeToPro: () => {
      if (!user) return;
      const users = readUsers();
      const idx = users.findIndex(u => u.email === user.email);
      if (idx >= 0) {
        users[idx].role = "instructor_pro";
        writeUsers(users);
        setUser({ ...user, role: "instructor_pro" });
      }
    },
    downgradeToNormal: () => {
      if (!user) return;
      const users = readUsers();
      const idx = users.findIndex(u => u.email === user.email);
      if (idx >= 0) {
        users[idx].role = "instructor";
        writeUsers(users);
        setUser({ ...user, role: "instructor" });
      }
    },
    updateProfile: (patch) => {
      if (!user) return { ok: false, error: "No hay sesión" };
      const users = readUsers();
      const idx = users.findIndex(u => u.email === user.email);
      if (idx < 0) return { ok: false, error: "Usuario no encontrado" };
      if (patch.fullName !== undefined) users[idx].fullName = patch.fullName;
      if (patch.age !== undefined) users[idx].age = patch.age;
      if (patch.password !== undefined && patch.password.length > 0) users[idx].password = patch.password;
      writeUsers(users);
      const { password: _p, ...rest } = users[idx];
      setUser(rest);
      return { ok: true };
    },
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
