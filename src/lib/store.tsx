import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { BUILTIN_COURSES, type Course } from "./courses";

export interface Comment {
  id: string;
  courseId: string;
  email: string;
  name: string;
  text: string;
  at: number;
}

export interface LiveSession {
  active: boolean;
  url?: string;
  topic?: string;
  startedAt?: number;
}

export interface PublicProfile {
  email: string;
  fullName: string;
  age: number;
  role: string;
}

interface StoreShape {
  customCourses: Course[];
  enrollments: Record<string, string[]>; // courseId -> student emails
  comments: Record<string, Comment[]>; // courseId -> comments
  ratings: Record<string, Record<string, number>>; // courseId -> {email:score}
  live: Record<string, LiveSession>; // courseId -> live info
  profiles: Record<string, PublicProfile>; // email -> profile
}

const KEY = "es_store_v2";
const empty: StoreShape = {
  customCourses: [], enrollments: {}, comments: {}, ratings: {}, live: {}, profiles: {},
};

function load(): StoreShape {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch { return empty; }
}
function save(s: StoreShape) { localStorage.setItem(KEY, JSON.stringify(s)); }

interface StoreCtx extends StoreShape {
  allCourses: () => Course[];
  courseById: (id: string) => Course | undefined;
  addCourse: (c: Course) => void;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  removeCourse: (id: string) => void;
  enroll: (courseId: string, email: string) => void;
  unenroll: (courseId: string, email: string) => void;
  isEnrolled: (courseId: string, email: string) => boolean;
  addComment: (c: Omit<Comment, "id" | "at">) => void;
  removeComment: (courseId: string, commentId: string) => void;
  setRating: (courseId: string, email: string, score: number) => void;
  averageRating: (courseId: string) => { avg: number; count: number };
  setLive: (courseId: string, session: LiveSession) => void;
  upsertProfile: (p: PublicProfile) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<StoreShape>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => { setS(load()); setReady(true); }, []);

  const update = (fn: (prev: StoreShape) => StoreShape) => {
    setS(prev => { const n = fn(prev); save(n); return n; });
  };

  const value: StoreCtx = {
    ...s,
    allCourses: () => [...BUILTIN_COURSES, ...s.customCourses],
    courseById: (id) => [...BUILTIN_COURSES, ...s.customCourses].find(c => c.id === id),
    addCourse: (c) => update(p => ({ ...p, customCourses: [...p.customCourses, c] })),
    updateCourse: (id, patch) => update(p => ({
      ...p,
      customCourses: p.customCourses.map(c => c.id === id ? { ...c, ...patch } : c),
    })),
    removeCourse: (id) => update(p => {
      const { [id]: _e, ...enr } = p.enrollments;
      const { [id]: _c, ...com } = p.comments;
      const { [id]: _r, ...rat } = p.ratings;
      const { [id]: _l, ...liv } = p.live;
      return {
        ...p,
        customCourses: p.customCourses.filter(c => c.id !== id),
        enrollments: enr, comments: com, ratings: rat, live: liv,
      };
    }),
    enroll: (courseId, email) => update(p => {
      const cur = p.enrollments[courseId] ?? [];
      if (cur.includes(email)) return p;
      return { ...p, enrollments: { ...p.enrollments, [courseId]: [...cur, email] } };
    }),
    unenroll: (courseId, email) => update(p => ({
      ...p,
      enrollments: { ...p.enrollments, [courseId]: (p.enrollments[courseId] ?? []).filter(e => e !== email) },
    })),
    isEnrolled: (courseId, email) => (s.enrollments[courseId] ?? []).includes(email),
    addComment: (c) => update(p => {
      const nc: Comment = { ...c, id: crypto.randomUUID(), at: Date.now() };
      return { ...p, comments: { ...p.comments, [c.courseId]: [...(p.comments[c.courseId] ?? []), nc] } };
    }),
    removeComment: (courseId, commentId) => update(p => ({
      ...p,
      comments: { ...p.comments, [courseId]: (p.comments[courseId] ?? []).filter(c => c.id !== commentId) },
    })),
    setRating: (courseId, email, score) => update(p => ({
      ...p,
      ratings: { ...p.ratings, [courseId]: { ...(p.ratings[courseId] ?? {}), [email]: score } },
    })),
    averageRating: (courseId) => {
      const r = s.ratings[courseId] ?? {};
      const scores = Object.values(r);
      if (scores.length === 0) return { avg: 0, count: 0 };
      return { avg: scores.reduce((a, b) => a + b, 0) / scores.length, count: scores.length };
    },
    setLive: (courseId, session) => update(p => ({ ...p, live: { ...p.live, [courseId]: session } })),
    upsertProfile: (pr) => {
      const existing = s.profiles[pr.email];
      if (existing && existing.fullName === pr.fullName && existing.age === pr.age && existing.role === pr.role) return;
      update(p => ({ ...p, profiles: { ...p.profiles, [pr.email]: pr } }));
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}
